
import { GameStateMachine, STATES } from './core/state-machine.js';
import { TimerRegistry } from './core/timer-registry.js';
import './game/combo.js';
import './game/screen-shake.js';
import './features/daily-challenges.js';
import './game/boss-phases.js';
import './features/teacher-dashboard.js';

window.GameMachine=new GameStateMachine();
window.STATES=STATES;
window.TimerRegistry=new TimerRegistry();
window.Safe={sanitize(s){return String(s).replace(/[<>"'&]/g,'').slice(0,50);},setText(el,t){if(el)el.textContent=this.sanitize(t);}};

console.log('[V23] Full Features loaded');

import('./core/legacy.js').then(()=>{console.log('[V23] Legacy loaded');});

import { io } from 'socket.io-client';
window.M3SHSocket={
  serverUrl:'https://m33sh.onrender.com',
  socket:null,
  isConnected:false,
  init(){
    this.socket=io(this.serverUrl,{transports:['websocket','polling'],timeout:10000});
    this.socket.on('connect',()=>{
      this.isConnected=true;
      document.getElementById('socket-status').textContent='ONLINE - Render V23';
      document.getElementById('socket-status').style.color='#00ff41';
    });
    this.socket.on('room_updated',(r)=>{window.currentRoomId=r.id;window.updateLobbyUI?.(r);});
    this.socket.on('answer_result',({correct,score,combo,multiplier,health})=>{
      if(correct){window.ComboSystem?.onCorrectAnswer();window.ScreenShake?.shake(3,100);window.DailyChallenges?.onEvent('meteor_solved',{difficulty:'normal'});if(combo>=5)window.DailyChallenges?.onEvent('combo',{combo});}
      else{window.ComboSystem?.onWrongAnswer();window.ScreenShake?.wrong();}
    });
    this.socket.on('boss_phase_change',({phase})=>{window.BossPhases?.onPhaseChange(phase);});
    this.socket.on('boss_defeated',()=>{window.BossPhases?.onDefeated();});
    this.socket.on('student_update',({studentId,data})=>{window.TeacherDashboard?.onStudentUpdate(studentId,data);});
    this.socket.on('teacher_pause_all',()=>{window.GameMachine?.transition('paused');});
    this.socket.on('teacher_resume_all',()=>{window.GameMachine?.transition('playing');});
  },
  emit(ev,d){if(this.socket&&this.isConnected)this.socket.emit(ev,d);},
  submitAnswer(room,meteorId,equation,answer,difficulty,timeTaken){this.emit('submit_answer',{room,meteorId,equation,answer,difficulty,timeTaken});}
};
setTimeout(()=>window.M3SHSocket.init(),1000);
