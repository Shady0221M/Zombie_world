var canvas=document.getElementById('canvas');
canvas.height=document.documentElement.clientHeight;
canvas.width=document.documentElement.clientWidth;
c=canvas.getContext('2d');
var hero;
var zombies=[];var zombie1;
var keys_pressed;
var ground_level=canvas.height;
var last_key;
var up_press=false;
var mouse=new Mouse();
var vel;var v=10;
var bullets=[];
var enemyCount=1;
var blocks=[];


function check_below(item,zob){
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
    if (zob=='block'){
        for (var i=0;i<blocks.length;i++){
            if (item.coordinate.y+item.height>blocks[i].coordinate.y){
                if (item.velocity.x>0){
                    if ((item.coordinate.x+item.width+item.velocity.x>=blocks[i].coordinate.x)&&
                    (item.coordinate.x<blocks[i].coordinate.x)){
                        return i;
                    }
                }else if(item.velocity.x<0){
                    if ((item.coordinate.x<=blocks[i].coordinate.x+blocks[i].width)&&(item.coordinate.x+item.width>blocks[i].coordinate.x+blocks[i].width)){
                        return i;
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
                    if ((item.coordinate.x+item.width+item.velocity.x>=zombies[i].coordinate.x)&&
                    (item.coordinate.x<zombies[i].coordinate.x)){
                        return i;
                    }
                }else if(item.velocity.x<0){
                    if ((item.coordinate.x<=zombies[i].coordinate.x+zombies[i].width)&&(item.coordinate.x+item.width>zombies[i].coordinate.x+zombies[i].width)){
                        return i;
                    }
                }
            }
        }
        return i;
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
    else{return false;}
}


function init(){
    c.clearRect(0,0,canvas.width,canvas.height);
    c.strokeRect(0,0,canvas.width,canvas.height);
    c.fillStyle='#682666';
    c.fillRect(0,0,canvas.width,canvas.height);
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
}

class Blocks{
    constructor(){
        this.height=40;
        this.width=40;
        this.coordinate={
            x:0,y:0
        }
        this.velocity={x:0,y:0}
        this.acceleration={x:0,y:0.2}
    }
    create(){
        c.fillStyle='#FFF5E1';
        c.strokeStyle='black';
        c.strokeRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
        c.fillRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
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
            }}
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
            if(check_bullet_zombie_collision(this,zombies[i])){this.velocity.x=0;
                this.velocity.y=0;
                zombies.splice(i,1);
                console.log('zombie eliminate:'+i);
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
        this.height=50;
        this.width=50;
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
            hero.velocity.x=5;
        }else if (keys_pressed.left.pressed && last_key.left.pressed){
            hero.velocity.x=-5;
        }
        else {
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
    
    create(){
        c.fillStyle='yellow';
        c.fillRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
    }
}

class Zombie{
    constructor(){
        this.height=50;
        this.width=50;
        this.coordinate={
            x:500,
            y:ground_level-5*this.width
        }
        this.velocity={
            x:0,
            y:0
        }
        this.acceleration={
            x:0,
            y:0.2
        }
    }
    jump(){
            if (this.coordinate.y+this.height+this.velocity.y<=ground_level){
                this.coordinate.y=this.coordinate.y+this.velocity.y;
                this.velocity.y=this.velocity.y+this.acceleration.y;
            }
        }
    translate(){
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
            else if (j==zombies.length){
                if (this.coordinate.x>hero.coordinate.x+hero.width){
                    this.velocity.x=-0.5;
                }else if(this.coordinate.x+this.width<hero.coordinate.x)
                    {this.velocity.x=0.5}
                else{
                        this.velocity.x=0;
                    }
                // if((this.coordinate.x+this.velocity.x>=0) && (this.coordinate.x+this.width+this.velocity.x<canvas.width))
                this.coordinate.x=this.coordinate.x+this.velocity.x;
            }
        }
        }
    
    create(){
        c.fillStyle='black';
        c.fillRect(this.coordinate.x,this.coordinate.y,this.width,this.height);
    }
}

init();
animate();

window.addEventListener('keydown',({keyCode})=>{
   
    switch (keyCode){
        case 37:{
            keys_pressed.left.pressed=true;
            last_key.left.pressed=true;
            last_key.right.pressed=false;
            break;
        }
        case 38:{
            if (!up_press){hero.velocity.y=-5;up_press=true;}
            break;
        }
        case 39:{
            keys_pressed.right.pressed=true;
            last_key.left.pressed=false;
            last_key.right.pressed=true;
            break;
        }
        case 40:{
            break;
        }
        case 65:{
            keys_pressed.left.pressed=true;
            last_key.left.pressed=true;
            last_key.right.pressed=false;
            break;
        }
        case 83:{
            break;
        }
        case 68:{
            keys_pressed.right.pressed=true;
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
        zombie.coordinate.x=0-100*(i+1);
        zombies.push(zombie);
    }
}

canvas.addEventListener('click',function(item){
    mouse.x=item.clientX;
    mouse.y=item.clientY;
    bullets.push(new Bullet());
    var bullet_new=bullets[bullets.length-1];
   
    theta=angle(mouse,bullet_new.coordinate.x+bullet_new.radius,bullet_new.coordinate.y+bullet_new.radius);
   
    vel=new Velocity(v,theta);
    bullet_new.velocity.x=vel.x;
    bullet_new.velocity.y=vel.y; 
      
   
}) 

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width,canvas.height);
    c.strokeRect(0,0,canvas.width,canvas.height);
    c.fillStyle='#682666';
    c.fillRect(0,0,canvas.width,canvas.height);
    //Blocks
    blocks.forEach((block)=>{
        block.create();
        block.translate();
    })

    //Player 
    hero.create();
    hero.jump();
    hero.translate();
    

    //Bullet
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


        //Zombies
        zombies.forEach((zombie)=>{
        zombie.create();
        zombie.translate();
        zombie.jump();
    })
        if(zombies.length==0){
            enemyCount++;
            SpawnEnemies(enemyCount);
        }
   
}

