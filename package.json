
const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');
const app=express();
app.use(cors({origin:['https://stockfishvshumans-lang.github.io','https://m33sh.onrender.com','http://localhost:5173'],methods:['GET','POST'],credentials:true}));
app.use(express.json());
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:['https://stockfishvshumans-lang.github.io','https://m33sh.onrender.com','http://localhost:5173'],methods:['GET','POST'],credentials:true},transports:['websocket','polling'],pingTimeout:60000});
const rooms=new Map();
const playerRooms=new Map();
const rateLimit=new Map();
const dailyStats=new Map(); // playerId -> {solved, hardSolved, etc}

function validateEquation(eq, ans){
  try{
    const clean=eq.replace(/[^0-9+\-*/=xX]/g,'');
    if(clean.includes('=')){
      const parts=clean.split('=');
      if(parts.length!==2)return false;
      const left=parts[0];const right=parseFloat(parts[1]);
      const m=left.match(/([0-9]*)x([+-][0-9]+)?/);
      if(!m)return false;
      const a=parseFloat(m[1]||'1');const b=parseFloat(m[2]||'0');
      const expected=(right-b)/a;
      return Math.abs(expected-parseFloat(ans))<0.01;
    }else{
      if(!/^[0-9+\-*/(). ]+$/.test(clean))return false;
      const expected=Function('"use strict";return('+clean+')')();
      return Math.abs(expected-parseFloat(ans))<0.01;
    }
  }catch(e){return false;}
}

io.on('connection',(socket)=>{
  console.log(`[V23] Connected ${socket.id}`);
  socket.on('create_room',({roomId,playerName,gameMode,isTeacher})=>{
    if(!roomId||!/^[A-Z0-9]{4,10}$/.test(roomId))roomId='ROOM'+Math.floor(Math.random()*10000);
    if(!rooms.has(roomId)){
      rooms.set(roomId,{
        id:roomId,host:socket.id,gameMode:gameMode||'vs',isClassroom:gameMode==='classroom',
        players:[{id:socket.id,name:(playerName||'Player').slice(0,20).replace(/[<>]/g,''),isHost:true,isTeacher:!!isTeacher,health:100,score:0,combo:0,accuracy:100,totalAnswers:0,correctAnswers:0}],
        createdAt:Date.now(),bossPhase:1
      });
    }
    socket.join(roomId);playerRooms.set(socket.id,roomId);
    io.to(roomId).emit('room_updated',rooms.get(roomId));
    socket.emit('room_created',{roomId,isHost:true});
    if(isTeacher) socket.emit('teacher_dashboard',{roomId,students:[]});
  });
  socket.on('join_room',({roomId,playerName})=>{
    const room=rooms.get(roomId);
    if(!room){socket.emit('error',{message:'Room not found'});return;}
    if(room.players.length>=10){socket.emit('error',{message:'Room full'});return;}
    if(!room.players.find(p=>p.id===socket.id)){
      room.players.push({id:socket.id,name:(playerName||'Player').slice(0,20).replace(/[<>]/g,''),isHost:false,isTeacher:false,health:100,score:0,combo:0,accuracy:100,totalAnswers:0,correctAnswers:0});
    }
    socket.join(roomId);playerRooms.set(socket.id,roomId);
    io.to(roomId).emit('room_updated',room);
    io.to(roomId).emit('player_joined',{playerId:socket.id,playerName});
    if(room.isClassroom){
      const teacher=room.players.find(p=>p.isTeacher);
      if(teacher) io.to(teacher.id).emit('student_joined',{studentId:socket.id,name:playerName});
    }
  });
  socket.on('submit_answer',({room,meteorId,equation,answer,difficulty,timeTaken})=>{
    if(playerRooms.get(socket.id)!==room)return;
    const now=Date.now();const last=rateLimit.get(socket.id)||0;
    if(now-last<300){socket.emit('answer_rate_limited');return;}
    rateLimit.set(socket.id,now);
    const isCorrect=validateEquation(equation,answer);
    const roomData=rooms.get(room);if(!roomData)return;
    const player=roomData.players.find(p=>p.id===socket.id);if(!player)return;
    player.totalAnswers=(player.totalAnswers||0)+1;
    if(isCorrect){
      player.correctAnswers=(player.correctAnswers||0)+1;
      player.accuracy=Math.floor((player.correctAnswers/player.totalAnswers)*100);
      player.score+=10;player.combo=(player.combo||0)+1;
      let mult=1;if(player.combo>=10)mult=3;else if(player.combo>=5)mult=2;else if(player.combo>=3)mult=1.5;
      player.score+=Math.floor(10*(mult-1));
      socket.emit('answer_result',{meteorId,correct:true,score:player.score,combo:player.combo,multiplier:mult});
      socket.to(room).emit('opponent_scored',{playerId:socket.id,score:player.score,combo:player.combo});
      if(roomData.isClassroom){
        const teacher=roomData.players.find(p=>p.isTeacher);
        if(teacher) io.to(teacher.id).emit('student_update',{studentId:socket.id,data:{name:player.name,health:player.health,score:player.score,accuracy:player.accuracy,timePerQuestion:timeTaken||0,currentEquation:equation,status:'playing'}});
      }
      // Daily stats
      const stats=dailyStats.get(socket.id)||{solved:0,hardSolved:0};
      stats.solved++;if(difficulty==='hard')stats.hardSolved++;
      dailyStats.set(socket.id,stats);
    }else{
      player.combo=0;player.health=Math.max(0,player.health-10);
      player.accuracy=Math.floor((player.correctAnswers/player.totalAnswers)*100);
      socket.emit('answer_result',{meteorId,correct:false,health:player.health,combo:0,accuracy:player.accuracy});
      if(player.health<=0){socket.to(room).emit('opponent_died',{playerId:socket.id});}
      if(roomData.isClassroom){
        const teacher=roomData.players.find(p=>p.isTeacher);
        if(teacher) io.to(teacher.id).emit('student_update',{studentId:socket.id,data:{name:player.name,health:player.health,score:player.score,accuracy:player.accuracy,timePerQuestion:timeTaken||0,currentEquation:equation,status:'playing'}});
      }
    }
    io.to(room).emit('room_updated',roomData);
  });
  socket.on('boss_damage',({room,damage})=>{
    const roomData=rooms.get(room);if(!roomData)return;
    if(!roomData.bossHp)roomData.bossHp=100;
    roomData.bossHp=Math.max(0,roomData.bossHp-damage);
    const hpPercent=(roomData.bossHp/100)*100;
    let phase=1;
    if(hpPercent<=25)phase=3;else if(hpPercent<=50)phase=2;
    if(phase!==roomData.bossPhase){roomData.bossPhase=phase;io.to(room).emit('boss_phase_change',{phase,hp:roomData.bossHp});}
    if(roomData.bossHp<=0){io.to(room).emit('boss_defeated',{room});roomData.bossHp=100;roomData.bossPhase=1;}
    io.to(room).emit('room_updated',roomData);
  });
  socket.on('teacher_command',({room,command,target})=>{
    const roomData=rooms.get(room);if(!roomData)return;
    const teacher=roomData.players.find(p=>p.id===socket.id&&p.isTeacher);
    if(!teacher)return;
    if(command==='pause_all'){io.to(room).emit('teacher_pause_all');}
    else if(command==='resume_all'){io.to(room).emit('teacher_resume_all');}
    else if(command==='pause'&&target){io.to(target).emit('teacher_pause');}
    else if(command==='help'&&target){io.to(target).emit('teacher_help',{message:'Teacher is here to help!'});}
  });
  socket.on('send_vs_state',({room,state})=>{
    if(playerRooms.get(socket.id)!==room)return;
    if(!state||typeof state.health!=='number'||typeof state.score!=='number')return;
    if(state.score>10000||state.health>100||state.health<0)return;
    socket.to(room).emit('receive_vs_state',{playerId:socket.id,state:{meteors:state.meteors?.slice(0,30),health:Math.max(0,Math.min(100,state.health)),score:Math.max(0,Math.min(10000,state.score))}});
  });
  socket.on('player_died',({room})=>{
    const r=rooms.get(room);if(r){const p=r.players.find(pl=>pl.id===socket.id);if(p)p.health=0;}
    socket.to(room).emit('opponent_died',{playerId:socket.id});
    if(r)io.to(room).emit('room_updated',r);
  });
  socket.on('leave_room',({roomId})=>{
    socket.leave(roomId);playerRooms.delete(socket.id);
    const room=rooms.get(roomId);
    if(room){
      const idx=room.players.findIndex(p=>p.id===socket.id);
      if(idx!==-1){
        const leftPlayer=room.players[idx];
        room.players.splice(idx,1);
        if(room.players.length===0)rooms.delete(roomId);
        else{
          if(room.host===socket.id){room.host=room.players[0].id;room.players[0].isHost=true;}
          io.to(roomId).emit('room_updated',room);
          if(room.isClassroom){const teacher=room.players.find(p=>p.isTeacher);if(teacher)io.to(teacher.id).emit('student_left',{studentId:socket.id});}
        }
      }
    }
  });
  socket.on('disconnect',()=>{
    const roomId=playerRooms.get(socket.id);
    if(roomId){
      const room=rooms.get(roomId);
      if(room){
        const idx=room.players.findIndex(p=>p.id===socket.id);
        if(idx!==-1){
          room.players.splice(idx,1);
          if(room.players.length===0)rooms.delete(roomId);
          else{
            if(room.host===socket.id){room.host=room.players[0].id;room.players[0].isHost=true;}
            io.to(roomId).emit('room_updated',room);
            if(room.isClassroom){const teacher=room.players.find(p=>p.isTeacher);if(teacher)io.to(teacher.id).emit('student_left',{studentId:socket.id});}
          }
        }
      }
      playerRooms.delete(socket.id);
    }
    rateLimit.delete(socket.id);dailyStats.delete(socket.id);
  });
});
app.get('/health',(req,res)=>res.json({status:'M3SH V23 Full Features Online',server:'https://m33sh.onrender.com',version:'23.0.0',features:'Daily Challenges, Boss Phases 3, Teacher Dashboard, Combo, Shake, Validation, 115 fixes',rooms:rooms.size,clients:io.engine.clientsCount,roomsList:Array.from(rooms.keys())}));
app.get('/',(req,res)=>res.json({message:'M3SH V23 Full Features',serverUrl:'https://m33sh.onrender.com',version:'23.0.0'}));
const PORT=process.env.PORT||3001;
server.listen(PORT,()=>console.log(`[M3SH V23] RUNNING ON ${PORT} - Daily + Boss Phases + Teacher Dashboard`));
setInterval(()=>{const now=Date.now();for(const[rid,r]of rooms.entries()){if(now-r.createdAt>3600000)rooms.delete(rid);}},600000);
