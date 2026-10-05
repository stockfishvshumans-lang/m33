<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>M3SH V23 Full Features - Daily + Boss + Teacher</title>
<link rel="stylesheet" href="./style.css">
<style>
#socket-status{position:fixed;top:2px;right:5px;background:rgba(0,0,0,0.9);color:#ffaa00;padding:3px 8px;font-size:9px;font-family:monospace;border:1px solid #ffaa00;z-index:100000;pointer-events:none;border-radius:4px}
#gadget-debug{position:fixed;top:2px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:#00e5ff;padding:3px 10px;font-size:10px;font-family:monospace;border:1px solid #00e5ff;z-index:100000;pointer-events:none;border-radius:4px}
#combo-display{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:#00ff41;text-shadow:0 0 20px #00ff41;pointer-events:none;z-index:10000;font-family:Orbitron,monospace}
.view.hidden{display:none!important;opacity:0!important;pointer-events:none!important}
@keyframes comboPop{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0}50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
@keyframes challengePop{0%{transform:translateX(-50%) translateY(-20px) scale(0.8);opacity:0}100%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
</style>
</head>
<body>
<div id="gadget-debug">V23 Full Features</div>
<div id="socket-status">Connecting to https://m33sh.onrender.com...</div>
<div id="combo-display"></div>
<div id="daily-challenges" style="position:fixed;bottom:10px;left:10px;width:300px;background:rgba(0,0,0,0.8);padding:10px;border-radius:8px;z-index:1000"></div>
<div id="home-screen" class="view">HOME V23 - Daily Challenges, Boss Phases, Teacher Dashboard</div>
<div id="lobby-screen" class="view hidden">LOBBY</div>
<div id="game-wrapper" class="view hidden"><canvas id="bgCanvas"></canvas><canvas id="gameCanvas"></canvas><div id="ui-layer"><div id="hud-top"></div><div id="hud-bottom"><div class="command-console"><input id="player-input" type="text" inputmode="numeric" autocomplete="off"></div></div></div></div>
<div id="defeat-modal" class="view hidden">DEFEATED <button onclick="safeExit()">Return</button></div>
<div id="victory-modal" class="view hidden">VICTORY <button onclick="safeExit()">Return</button></div>
<script type="module" src="./src/main.js"></script>
</body>
</html>
