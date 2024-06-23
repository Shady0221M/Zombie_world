var canvas=document.getElementById('canvas');
canvas.height=document.documentElement.clientHeight;
canvas.width=document.documentElement.clientWidth;
c=canvas.getContext('2d');

var canvas2=document.getElementById('canvas2');
canvas2.height=document.documentElement.clientHeight;
canvas2.width=document.documentElement.clientWidth;
c2=canvas2.getContext('2d');

var hero;
var zombies;var zombie1;
var keys_pressed;
var ground_level=canvas.height-70;
var last_key;
var up_press=false;
var mouse=new Mouse();
var vel;var v=10;
var bullets;
var pellets;
var enemyCount;
var blocks;
var is_game_paused=false;
var score_print;
var score;
var fort;
var kill_strike;
var track;
var shield_coordinates;
const backgroundImage = new Image();
var is_game_over=false;
var toggle_weapon;
var gunImage;
var gun;
var mouse1;
var weapon_selected;

function initializeLocalStorage() {
    if (!localStorage.getItem('score1')) {
        localStorage.setItem('score1', '0');
    }
    if (!localStorage.getItem('score2')) {
        localStorage.setItem('score2', '0');
    }
    if (!localStorage.getItem('score3')) {
        localStorage.setItem('score3', '0');
    }
}
initializeLocalStorage()
function check_below(item,zob){
    var i=0;
    if (zob=='block'){
        for (var i=0;i<blocks.length;i++){
            if (blocks[i]!=item){
                if ((item.coordinate.y+item.height+item.velocity.y>=blocks[i].coordinate.y)&&
                (item.coordinate.y<=blocks[i].coordinate.y)&&
                ((item instanceof Player)?(item.coordinate.y+item.width!=ground_level):true)&&
                (item.coordinate.x<blocks[i].coordinate.x+blocks[i].width)&&
                (item.coordinate.x+item.width>blocks[i].coordinate.x))
                 {return i;}
            }
        }
        return i;
    }
}

function check_infront(item,zob){
    var i=0;
    if (zob=='block'){
        for (var i=0;i<blocks.length;i++){
            if (item.coordinate.y+item.height>blocks[i].coordinate.y){
                if (item.velocity.x>0){
                    if ((item.coordinate.x+item.width+item.velocity.x>=blocks[i].coordinate.x)&&(item.coordinate.x<blocks[i].coordinate.x)){
                        return i;
                    }
                }else if(item.velocity.x<0){
                    if ((item.coordinate.x-item.velocity.x<=blocks[i].coordinate.x+blocks[i].width)&&(item.coordinate.x+item.width>blocks[i].coordinate.x+blocks[i].width)){
                        return i;
                    }
                }else{
                    if (item.direction=='right' && item instanceof Zombie){
                        if ((item.coordinate.x+item.width+0.5>=blocks[i].coordinate.x)&&(item.coordinate.x<blocks[i].coordinate.x)){
                        return i;
                    }
                    }else if(item.direction=='left' && item instanceof Zombie){
                        if ((item.coordinate.x-0.5<=blocks[i].coordinate.x+blocks[i].width)&&(item.coordinate.x+item.width>blocks[i].coordinate.x+blocks[i].width)){
                            return i;
                        }
                    }
                }
            }
        }
        return i;
    }
    else if (zob=='zombie'){
        for (var i=0;i<zombies.length;i++){
            if (item.coordinate.y+item.height>zombies[i].coordinate.y){
                if (item.velocity.x>0){
                    if ((item.coordinate.x+item.width+item.velocity.x>=zombies[i].coordinate.x)&&(item.coordinate.x<zombies[i].coordinate.x)&&((zombies[i].velocity.x==0)||(zombies[i].freeze))){
                        return i;
                    }
                }else if(item.velocity.x<0){
                    if ((item.coordinate.x+item.velocity.x<=zombies[i].coordinate.x+zombies[i].width)&&(item.coordinate.x+item.width>zombies[i].coordinate.x+zombies[i].width)&& ((zombies[i].velocity.x==0)||(zombies[i].freeze))){
                        return i;
                    }
                }else{
                    if (item.direction=='right' && item instanceof Zombie){
                        if ((item.coordinate.x+item.width+0.5>=zombies[i].coordinate.x)&&(item.coordinate.x<zombies[i].coordinate.x)&&(zombies[i].velocity.x==0)){
                            return i;
                    }
                    }else if(item.direction=='left' && item instanceof Zombie){
                        if ((item.coordinate.x-0.5<=zombies[i].coordinate.x+zombies[i].width)&&(item.coordinate.x+item.width>zombies[i].coordinate.x+zombies[i].width)&&(zombies[i].velocity.x==0)){
                            return i;
                        }
                    }
                }
            }
        }
        return i;
    }
    else if (zob=='fort'){
        if ((item.coordinate.x>fort.coordinate.x)&&(item.coordinate.x+item.width<fort.coordinate.x+fort.width)){return true;}
    }
}

function Velocity(v,angle){
    this.angle=angle;
    this.x=v*(Math.cos(this.angle));
    if (this.angle<0){this.x=-this.x}
    this.y=-(v*Math.abs((Math.sin(this.angle))));
}
function Mouse(){
    this.x=window.innerWidth/2;
    this.y=window.innerHeight/2;
}
function angle(mouse,x,y){
    var xdistance=mouse.x-x;
    var ydistance=y-mouse.y;
    return Math.atan(ydistance/xdistance);
}


function check_bullet_zombie_collision(bullet,zombie){
    if(zombie.coordinate.x>hero.coordinate.x+hero.width){
        if ((bullet.coordinate.x+bullet.radius>zombie.coordinate.x)&&(bullet.coordinate.x-bullet.radius<zombie.coordinate.x)&&((bullet.coordinate.y+bullet.radius>zombie.coordinate.y))){return true;}
        else if((bullet.coordinate.y+bullet.radius>zombie.coordinate.y)&&(bullet.coordinate.y-bullet.radius<zombie.coordinate.y)&&(((bullet.coordinate.x+bullet.radius>zombie.coordinate.x)&&(bullet.coordinate.x-bullet.radius<zombie.coordinate.x+zombie.width))||((bullet.coordinate.x+bullet.radius>zombie.coordinate.x+zombie.width)&&(bullet.coordinate.x-bullet.radius<zombie.coordinate.x+zombie.width)))){return true;}
    }
    else if (zombie.coordinate.x+zombie.width<hero.coordinate.x){
        if ((bullet.coordinate.x-bullet.radius<zombie.coordinate.x+zombie.width)&&(bullet.coordinate.x+bullet.radius>zombie.coordinate.x)&&(bullet.coordinate.y+bullet.radius>zombie.coordinate.y)){return true;}
        else if ((bullet.coordinate.y+bullet.radius>zombie.coordinate.y)&&(bullet.coordinate.y-bullet.radius<zombie.coordinate.y)&&(((bullet.coordinate.x+bullet.radius<zombie.coordinate.x+zombie.width)&&(bullet.coordinate.x-bullet.radius>zombie.coordinate.x))||((bullet.coordinate.x-bullet.radius<zombie.coordinate.x)&&(bullet.coordinate.x+bullet.radius>zombie.coordinate.x)))){return true;}
    }
    if (zombie.coordinate.x+zombie.width>=hero.coordinate.x && zombie.coordinate.x<=hero.coordinate.x+hero.width){
        if ((bullet.coordinate.y+bullet.radius>zombie.coordinate.y)&&(bullet.coordinate.y-bullet.radius<zombie.coordinate.y)&&(((bullet.coordinate.x+bullet.radius<zombie.coordinate.x+zombie.width)&&(bullet.coordinate.x-bullet.radius>zombie.coordinate.x))||((bullet.coordinate.x-bullet.radius<zombie.coordinate.x)&&(bullet.coordinate.x+bullet.radius>zombie.coordinate.x)))){return true;}
    }
    else{return false;}
}


function init(){
    weapon_selected=new Image();
    mouse1 = {
        x: 0,
        y: 0
    };
    gunImage=new Image();
    gun = {
      x: canvas2.width / 2,
       y: canvas2.height / 2,
       width: 72,
       height: 73 
    };
    blocks=[];
    pellets=[];
    bullets=[];
    zombies=[];
    enemyCount=1;
    toggle_weapon='bomb';
    score=0;
    score_print='00000';
    is_game_over=false;
    is_game_paused=false;
    ground_level=canvas.height-100;
    kill_strike=0;
    track='none';
    shield_coordinates={x:0,y:0};
    c.clearRect(0,0,canvas.width,canvas.height);
    c.strokeRect(0,0,canvas.width,canvas.height);
    c.fillStyle='#682666';
    c.fillRect(0,0,canvas.width,canvas.height);
    fort=new Fort();
    fort.create();
    //Background
    backgroundImage.src = '../images/background_images/background_hacker.png';
    //Defense Blocks creation
    for (var i=0;i<8;i++){
        var block=new Blocks();
        block.coordinate.x=Math.random()*(canvas.width-block.width);
        block.coordinate.y=Math.random()*(canvas.height-block.height);
        block.create();
        blocks.push(block);
    }
    //Survivor Creation
    hero=new Player();
    hero.create();
    keys_pressed={
        right:{
            pressed:false
        },
        left:{
            pressed:false
        }
    }
    last_key={
        right:{pressed:false},
        left:{pressed:false}
    }
    setTimeout(SpawnEnemies(1),5000);
    document.getElementById('pause').addEventListener('click',pause_game);
}

function pause_game(){
    is_game_paused=true;
    document.getElementById('pause').removeEventListener('click',pause_game);
    document.getElementById('gamepause').style.display='block';
    document.getElementById('play').addEventListener('click',play_game);
    document.getElementById('replay').addEventListener('click',replay_game);

}
function replay_game(){
    is_game_paused=false;
    document.getElementById('play').removeEventListener('click',play_game);
    document.getElementById('replay').removeEventListener('click',replay_game);
    document.getElementById('replay2').removeEventListener('click',replay_game);
    document.getElementById('pause').addEventListener('click',pause_game);
    document.getElementById('gamepause').style.display='none';
    document.getElementById('endOfGame').style.display='none';
    init();
    animate();
}

function play_game(){
    is_game_paused=false;
    document.getElementById('play').removeEventListener('click',play_game);
    document.getElementById('replay').removeEventListener('click',replay_game);
    document.getElementById('pause').addEventListener('click',pause_game);
    document.getElementById('gamepause').style.display='none';
    animate();
}
class Fort{
    constructor(){
        this.height=280;
        this.width=200;
        this.coordinate={x:(canvas.width-this.width)/2,y:(ground_level-this.height)}
        this.health=100;
        this.toggle=0;
        this.image=new Image();
    }
    create(){
        this.image.src='../images/fort_plain.png';
        c.drawImage(this.image,0,0,422,539,this.coordinate.x,this.coordinate.y,this.width,this.height);
        
    }
    strength_build(){
        if (check_infront(hero,'fort')&&(this.toggle<3)){
            this.image.src='../images/fort_green.png';
            c.drawImage(this.image,0,0,422,539,this.coordinate.x,this.coordinate.y,this.width,this.height);
            this.toggle++;
            if (hero.health<=100)
            {hero.health=hero.health+0.05;}
            // c.fillStyle='black';
            // c.fillRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
        }
        else{
            this.image.src='../images/fort_plain.png';
            c.drawImage(this.image,0,0,422,539,this.coordinate.x,this.coordinate.y,this.width,this.height);
            this.toggle++;
            // c.fillStyle='green';
            // c.fillRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
            if (this.toggle==6){this.toggle=0}
        }
    }
}
class Blocks{
    constructor(){
        this.height=60;
        this.width=60;
        this.coordinate={
            x:0,y:0
        }
        this.velocity={x:0,y:0}
        this.acceleration={x:0,y:0.2}
        this.image=new Image();
    }
    create(){
        this.image.src='../images/block.png';
        c.drawImage(this.image,0,0,249,267,this.coordinate.x,this.coordinate.y,this.width,this.height);
    }
    translate(){
            var j=check_below(this,'block');
            if (j<blocks.length){
                this.velocity.y=0;
                this.coordinate.y=blocks[j].coordinate.y-this.height;
               
            }
            else if(j==blocks.length){
                if (this.coordinate.y+this.height+this.velocity.y<=ground_level){
                  this.coordinate.y=this.coordinate.y+this.velocity.y;
                  this.velocity.y=this.velocity.y+this.acceleration.y;
                }else{
                    this.velocity.y=0;
                    this.coordinate.y=ground_level-this.height;
            }}
        }
    
}
class Pellet{
    constructor(){
        this.radius=10;
        this.coordinate={
            x:gun.x,
            y:gun.y
        }
        this.velocity={
            x:0,
            y:0
        }
        this.acceleration={
            x:0,
            y:0.2
        }
        this.image=new Image();
        this.frame=1;
    }
    create(){
        this.image.src='../Sprite/snow_ball.png';
        c.drawImage(this.image,0,0,539,539,this.coordinate.x-this.radius,this.coordinate.y-this.radius,this.radius*2,this.radius*2);
    }
    
    fire(){
        for(var i=zombies.length-1;i>=0;i--){
            if(check_bullet_zombie_collision(this,zombies[i])){
                // if (track=='zombie'){
                //     switch(kill_strike){
                //         case 0:{kill_strike++;break;}
                //         case 1:{hero.shield_access=true;shield_coordinates=zombies[i].coordinate;kill_strike=0;break;}
                //     }
                // // }
                // track='zombie';
                zombies[i].freeze=true;
                this.velocity.x=0;
                this.velocity.y=0;
                break;}
        }
        if (i=-1){
            if (this.coordinate.y+this.radius+this.velocity.y<ground_level){
                this.coordinate.y=this.coordinate.y+this.velocity.y;
                this.velocity.y=this.velocity.y+this.acceleration.y;
                this.coordinate.x=this.coordinate.x+this.velocity.x;
            }
            else{this.coordinate.y=ground_level-this.radius;
                this.coordinate.x=this.coordinate.x+this.velocity.x;
                track='none';
                kill_strike=0;
                this.velocity.x=0;
                this.velocity.y=0;
            }
        }
        
    }
    over(){
        this.image.src='../Sprite/Blast.png';
        c.drawImage(this.image,200*(this.frame-1),0,200,200,this.coordinate.x-this.radius,this.coordinate.y-this.radius,this.radius*4,this.radius*4);
        this.frame=this.frame+1;
        
    }
}
class Bullet{
    constructor(){
        this.radius=20;
        this.coordinate={
            x:hero.coordinate.x+(hero.width-this.radius*2)/2,
            y:hero.coordinate.y+(hero.height-this.radius*2)/2
        }
        this.velocity={
            x:0,
            y:0
        }
        this.acceleration={
            x:0,
            y:0.2
        }
        this.image=new Image();
        this.frame=1;
    }
    create(){
        this.image.src='../Sprite/Bomb.png';
        c.drawImage(this.image,0,0,350,320,this.coordinate.x-this.radius,this.coordinate.y-this.radius,this.radius*2,this.radius*2);
    }
    
    fire(){
        for(var i=zombies.length-1;i>=0;i--){
            if(check_bullet_zombie_collision(this,zombies[i])){
                if (track=='zombie'){
                    switch(kill_strike){
                        case 0:{kill_strike++;break;}
                        case 1:{hero.shield_access=true;shield_coordinates=zombies[i].coordinate;kill_strike=0;break;}
                    }
                }
                zombies.splice(i,1);
                score=score+10;
                score_print=score.toString();
                switch(score_print.length){
                    case 2:{score_print='000'+score_print;break;}
                    case 3:{score_print='00'+score_print;break;}
                    case 4:{score_print='0'+score_print;break;}
                    case 5:{score_print=score_print;}
                }
                track='zombie';
                this.velocity.x=0;
                this.velocity.y=0;
                break;}
        }
        if (i=-1){
            if (this.coordinate.y+this.radius+this.velocity.y<ground_level){
                this.coordinate.y=this.coordinate.y+this.velocity.y;
                this.velocity.y=this.velocity.y+this.acceleration.y;
                this.coordinate.x=this.coordinate.x+this.velocity.x;
            }
            else{this.coordinate.y=ground_level-this.radius;
                this.coordinate.x=this.coordinate.x+this.velocity.x;
                track='none';
                kill_strike=0;
                this.velocity.x=0;
                this.velocity.y=0;
            }
        }
        
    }
    over(){
        this.image.src='../Sprite/Blast.png';
        c.drawImage(this.image,200*(this.frame-1),0,200,200,this.coordinate.x-this.radius,this.coordinate.y-this.radius,this.radius*4,this.radius*4);
        this.frame=this.frame+1;
        
    }
    
}

class Player{
    constructor(){
        this.height=120;
        this.width=30;
        this.image=new Image();
        this.coordinate={
            x:300,
            y:ground_level-5*this.width
        }
        this.velocity={
            x:-2,
            y:0
        }
        this.acceleration={
            x:0,
            y:0.2
        }
        this.health=100;
        this.currenthealth_image=new Image();
        this.health_image=new Image();
        this.shield_access=false;
        this.shieldImage=new Image();
        this.shield_currentImage=new Image();
        this.shield_width=100;
        this.image.src='../Sprite/player_walk_right.png';
        this.frame=0;
        this.direction;
    }
    jump(){    
             var j=check_below(this,'block');

            if (j<blocks.length){
                this.velocity.y=0;
                this.coordinate.y=blocks[j].coordinate.y-this.height;
                up_press=false;
            }
            else if(j==blocks.length){
                if (this.coordinate.y+this.height+this.velocity.y<=ground_level){
                    this.coordinate.y=this.coordinate.y+this.velocity.y;
                    this.velocity.y=this.velocity.y+this.acceleration.y;
                }
                else{
                    this.coordinate.y=ground_level-this.height;this.velocity.y=0;
                    up_press=false;
                }
            }
        }
    translate(){
        if (keys_pressed.right.pressed && last_key.right.pressed){
            hero.velocity.x=5;this.direction='right';
            this.image.src='../Sprite/player_walk_right.png';
        }else if (keys_pressed.left.pressed && last_key.left.pressed){
            hero.velocity.x=-5;this.direction='left';
            this.image.src='../Sprite/player_walk_left.png';
        }
        else {
            if(this.direction=='right'){this.image.src='../Sprite/player_walk_right.png';}
            else{this.image.src='../Sprite/player_walk_left.png';}
            hero.velocity.x=0;
        }

        var j=check_infront(this,'block');
        if (j<blocks.length){
            if (this.velocity.x>0){
                this.coordinate.x=blocks[j].coordinate.x-this.width;
            }
            else if (this.velocity.x<0){
                this.coordinate.x=blocks[j].coordinate.x+blocks[j].width;
            }
             this.velocity.x=0;
            
        }
        else if (j==blocks.length){
            if((this.coordinate.x+this.velocity.x>=0) && (this.coordinate.x+this.width+this.velocity.x<canvas.width))
                this.coordinate.x=this.coordinate.x+this.velocity.x;
        }
        }
    shield(){
        if (this.shield_access==true){
            this.shieldImage.src='../images/shield_powerup.png';
            c.drawImage(this.shieldImage,0,0,108,116,shield_coordinates.x,shield_coordinates.y,40,40);
            console.log((this.coordinate.x+this.width>=shield_coordinates.x &&this.coordinate.x<shield_coordinates.x+40 &&this.coordinate.y>=shield_coordinates.y));
            if (this.coordinate.x+this.width>=shield_coordinates.x &&this.coordinate.x<shield_coordinates.x+40 &&this.coordinate.y>=shield_coordinates.y){
                this.shield_access='on';
            }
        }
        else if (this.shield_access=='on'){
            this.shieldImage.src='../images/shield_powerup_timer.png';
            c.drawImage(this.shieldImage,0,0,426,141,0,0,426,100);
            this.shield_currentImage.src='../images/shield_powerup_full.png';
            c.drawImage(this.shield_currentImage,0,0,338,141,86,0,338*(this.shield_width/100),100);
            this.shield_width=this.shield_width-0.1;
            if (this.shield_width<=0){
                this.shield_width=100;
                this.shield_access=false;
            }
        }

    }
    
    create(){
        this.health_image.src='../images/EmptyHealth.png';
        c.drawImage(this.health_image,0,0,498,103,this.coordinate.x-7,this.coordinate.y-15,(this.width+30),6);
        this.currenthealth_image.src='../images/Full Health.png';
        c.drawImage(this.currenthealth_image,0,0,498,103,this.coordinate.x-7,this.coordinate.y-15,(this.width+30)*(this.health/100),6);

        c.drawImage(this.image,100*(Math.ceil(this.frame/6)),0,100,130,this.coordinate.x-30,this.coordinate.y,this.width+60,this.height);
        if (this.velocity.x!=0){this.frame=this.frame+1;}
        else{this.frame=0}
        if (this.frame>=48){this.frame=0}
    }
}

class Zombie{
    constructor(){
        this.height=120;
        this.width=40;
        this.image=new Image();
        this.coordinate={
            x:500,
            y:ground_level-this.height
        }
        this.velocity={
            x:0,
            y:0
        }
        this.acceleration={
            x:0,
            y:0.2
        }
        this.direction;
        this.freeze=false;
        this.ice_cap=new Image();
        this.ice_cap.src='../images/ice_burg.png';
        this.ice_cap_duration=0;
    }
    attack_block(){
        var j=check_infront(this,'block');
        if (j<blocks.length){
            if (blocks[j].height>3)
            {blocks[j].height=blocks[j].height-0.2}
            else{blocks.splice(j,1)}
        }
    }
    attack_player(){
        if (hero.shield_access!='on'){
            if (this.coordinate.x+this.width<=hero.coordinate.x){
          
                if (hero.coordinate.x-this.coordinate.x-this.width<10){
                        hero.health=hero.health-0.1;
                }
            }
            else if (this.coordinate.x>=hero.coordinate.x+hero.width){
               
                if(this.coordinate.x-hero.coordinate.x-hero.width<10){
                    hero.health=hero.health-0.1;
                }
            }
            else if(hero.coordinate.x+hero.width>this.coordinate.x && hero.coordinate.x<this.coordinate.x+this.width){
                hero.health=hero.health-0.1;
            }
        }
        
    }
    jump(){
            if (this.coordinate.y+this.height+this.velocity.y<=ground_level){
                this.coordinate.y=this.coordinate.y+this.velocity.y;
                this.velocity.y=this.velocity.y+this.acceleration.y;
            }
        }
    translate(){
        if (!this.freeze){
            if (this.coordinate.x>hero.coordinate.x+hero.width){
                this.velocity.x=-0.5;this.direction='left';
                this.image.src='../Sprite/zombie_walk_left.png';
            }else if(this.coordinate.x+this.width<hero.coordinate.x)
                {this.velocity.x=0.5;this.direction='right';
                    this.image.src='../Sprite/zombie_walk_right.png';}
            else{
                    this.velocity.x=0;
                }
        }
        
        // if((this.coordinate.x+this.velocity.x>=0) && (this.coordinate.x+this.width+this.velocity.x<canvas.width))
        this.coordinate.x=this.coordinate.x+this.velocity.x;

        var j=check_infront(this,'block');
        if (j<blocks.length){
            if (this.velocity.x>0){
                this.coordinate.x=blocks[j].coordinate.x-this.width;
            }
            else if (this.velocity.x<0){
                this.coordinate.x=blocks[j].coordinate.x+blocks[j].width;
            }
            this.velocity.x=0;
        }
        else if (j==blocks.length){
            var j=check_infront(this,'zombie');
            if (j<zombies.length){
                 if (this.velocity.x>0){
                    this.coordinate.x=zombies[j].coordinate.x-this.width;
                }
                else if (this.velocity.x<0){
                   this.coordinate.x=zombies[j].coordinate.x+zombies[j].width;
                }
            this.velocity.x=0;
            }
        }
        }
    
    create(){
        c.drawImage(this.image,150*(Math.ceil(this.frame/8)),0,150,150,this.coordinate.x-40,this.coordinate.y,this.width+80,this.height);
        if (this.velocity.x!=0 && !this.freeze){this.frame=this.frame+1;}
        else{this.frame=0;}
        if (this.frame>=64){this.frame=0}
        
        if (this.freeze){c.globalAlpha=0.65;
            if (this.direction=='left'){c.drawImage(this.ice_cap,0,0,82,139,this.coordinate.x-15,this.coordinate.y-10,this.width+20,this.height+10);}
            else if (this.direction=='right'){c.drawImage(this.ice_cap,0,0,82,139,this.coordinate.x,this.coordinate.y-10,this.width+20,this.height+10);}
            c.globalAlpha=1;
            this.ice_cap_duration++;
            if (this.ice_cap_duration>400){
                this.ice_cap_duration=0;
                this.freeze=false;this.velocity.x=0;
            }
        }
    }
}

init();
animate();

window.addEventListener('keydown',({keyCode})=>{
   
    switch (keyCode){
        case 37:{
            keys_pressed.left.pressed=true;
            last_key.left.pressed=true;hero.direction='left';
            last_key.right.pressed=false;
            break;
        }
        case 38:{
            if (!up_press){hero.velocity.y=-5;up_press=true;}
            break;
        }
        case 39:{
            keys_pressed.right.pressed=true;hero.direction='right';
            last_key.left.pressed=false;
            last_key.right.pressed=true;
            break;
        }
        case 40:{
            break;
        }
        case 65:{
            keys_pressed.left.pressed=true;hero.direction='left';
            last_key.left.pressed=true;
            last_key.right.pressed=false;
            break;
        }
        case 83:{
            break;
        }
        case 68:{
            keys_pressed.right.pressed=true;hero.direction='right';
            last_key.left.pressed=false;
            last_key.right.pressed=true;
            break;
        }
        case 87:{
            if (!up_press){hero.velocity.y=-5;}
            break;
        }

    }
})

window.addEventListener('keyup',({keyCode})=>{
    switch (keyCode){
        case 37:{
            keys_pressed.left.pressed=false;
            break;
        }
        case 38:{
            break;
        }
        case 39:{
            keys_pressed.right.pressed=false;
            break;
        }
        case 40:{
            break;
        }
        case 65:{
           
            keys_pressed.left.pressed=false;
            break;
        }
        case 83:{
            break;
        }
        case 68:{
            keys_pressed.right.pressed=false;
            break;
        }
        case 87:{
            break;
        }
        case 32:{
            console.log('toggle weapon');
            if (toggle_weapon=='bomb'){toggle_weapon='ice_gun';document.getElementById('weapon1').src='../images/gun_left.png';}
            else if (toggle_weapon=='ice_gun'){toggle_weapon='bomb';document.getElementById('weapon1').src='../Sprite/Bomb1.png';}
        }
    }
})
canvas2.addEventListener('mousemove', function(event) {
    mouse1.x = event.clientX;
    mouse1.y = event.clientY;
});

canvas2.addEventListener('click',function(item){
    mouse.x=item.clientX;
    mouse.y=item.clientY;
    if (toggle_weapon=='bomb'){
        bullets.push(new Bullet());
        var bullet_new=bullets[bullets.length-1];
        theta=angle(mouse,bullet_new.coordinate.x+bullet_new.radius,bullet_new.coordinate.y+bullet_new.radius);
        vel=new Velocity(v,theta);
        bullet_new.velocity.x=vel.x;
        bullet_new.velocity.y=vel.y; 
        if (vel.x<0){hero.direction='left'}else{hero.direction='right'}
    }
    else if (toggle_weapon=='ice_gun'){
        pellets.push(new Pellet());
        var pellet_new=pellets[pellets.length-1];
        theta=angle(mouse,pellet_new.coordinate.x+pellet_new.radius,pellet_new.coordinate.y+pellet_new.radius);
        vel=new Velocity(v,theta);
        pellet_new.velocity.x=vel.x;
        pellet_new.velocity.y=vel.y; 
        if (vel.x<0){hero.direction='left'}else{hero.direction='right'}
    }
    
}) 

function SpawnEnemies(enemyCount){
    for (var i=0;i<enemyCount;i++){
        var zombie=new Zombie();
        zombie.coordinate.x=canvas.width+100*(i+1);
        zombies.push(zombie);
    }
    for(var i=enemyCount;i<2*enemyCount;i++){
        var zombie=new Zombie();
        zombie.coordinate.x=0-100*(i-enemyCount+1)-zombie.width;
        zombies.push(zombie);
    }
}



function GameOver(){
    is_game_over=true;document.getElementById('endOfGame').style.display='block';
    document.getElementById('replay2').addEventListener('click',replay_game);
    score=document.getElementById('score').innerHTML;
    score_int=parseInt(score);
    s1=parseInt(localStorage.getItem('score1'));
    s2=parseInt(localStorage.getItem('score2'));
    s3=parseInt(localStorage.getItem('score3'));
    if (score_int>s1){
        document.getElementById('hs3').innerHTML=localStorage.getItem('score2');
        document.getElementById('hs2').innerHTML=localStorage.getItem('score1');
        document.getElementById('hs1').innerHTML=score+' (New Highscore)';
        localStorage.setItem('score3',localStorage.getItem('score2'));
        localStorage.setItem('score2',localStorage.getItem('score1'));
        localStorage.setItem('score1',score);
    }
    else if (score_int>s2){
        document.getElementById('hs1').innerHTML=localStorage.getItem('score1');
        document.getElementById('hs3').innerHTML=localStorage.getItem('score2');
        document.getElementById('hs2').innerHTML=score+' (New Highscore)';
        localStorage.setItem('score3', localStorage.getItem('score2'));
        localStorage.setItem('score2', score);
    }
    else if (score_int>s3){
        document.getElementById('hs1').innerHTML=localStorage.getItem('score1');
        document.getElementById('hs2').innerHTML=localStorage.getItem('score2');
        document.getElementById('hs3').innerHTML=score+' (New Highscore)';
        
        localStorage.setItem('score3',score);
        localStorage.setItem('score2', localStorage.getItem('score2'));
        localStorage.setItem('score1', localStorage.getItem('score1'));
    }
    else{
        document.getElementById('hs1').innerHTML=localStorage.getItem('score1');
        document.getElementById('hs2').innerHTML=localStorage.getItem('score2');
        document.getElementById('hs3').innerHTML=localStorage.getItem('score3');
    }
}

function animate(){
    if (hero.health<=0){GameOver();}
    if (!is_game_paused&& !is_game_over){requestAnimationFrame(animate);}
    
    c.clearRect(0,0,canvas.width,canvas.height);
    c.drawImage(backgroundImage,0,0,canvas.width,canvas.height);
    //Weapon Selected
    //Fort
    fort.strength_build();
    //Blocks
    blocks.forEach((block)=>{
        block.create();
        block.translate();
    })

    //Player 
    hero.create();
    hero.jump();
    hero.translate();
    hero.shield();
    

    //Bomb
    bullets.forEach((bullet,index)=>{
        
        if (bullet.velocity.x==0){
            
            bullet.over();
            if (bullet.frame>8){
                bullets.splice(index,1);
                return;
            }
           
        }
        else{
            bullet.create();
            bullet.fire();
        }
        });
    //Ice Pellets
    pellets.forEach((pellet,index)=>{
        
        if (pellet.velocity.x==0){
            
            pellet.over();
            if (pellet.frame>8){
                pellets.splice(index,1);
                return;
            }
           
        }
        else{
            pellet.create();
            pellet.fire();
        }
        });
    //Gun
    if (toggle_weapon=='ice_gun'){
        c2.clearRect(0, 0, canvas2.width, canvas2.height);
            if (hero.direction=='right'){
                gun.x=hero.coordinate.x+hero.width;
                gun.y=hero.coordinate.y+hero.height/2;
            }
            else{
                gun.x=hero.coordinate.x;
                gun.y=hero.coordinate.y+hero.height/2;
            }
            var dx = mouse1.x - gun.x;
            if (dx>=0){gunImage.src='../images/gun_right.png';
                hero.direction='right';
            }
            else{gunImage.src='../images/gun_left.png';
                hero.direction='left';
            }
            var dy = mouse1.y - gun.y;
            var angle = Math.atan2(dy, dx);
            c2.save();
            c2.translate(gun.x, gun.y);
            if (dx>=0){c2.rotate(angle);}
            else{angle += Math.PI;c2.rotate(angle);}
            
            c2.drawImage(gunImage, -gun.width / 2, -gun.height / 2, gun.width, gun.height);
            console.log('drawn');
            c2.restore();
    }
    else{
        c2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
    

        //Zombies
        zombies.forEach((zombie)=>{
            
                zombie.create();
                if (!zombie.freeze){
                zombie.translate();
                zombie.jump();
                zombie.attack_block();
                zombie.attack_player();}
        
    })
        if(zombies.length==0){
            enemyCount++;
            SpawnEnemies(enemyCount);
        }

        //Score
        document.getElementById('score').innerHTML=score_print;
   
}

