/* 
Controls to add:
Vaccination variables: 
rate of vaccination, efficacy decline rate

Virus variables:
- transmission rate, death rate, percent asymptomatic (symptomatic = social distancing), incubation recovery period, reinfection checkbox
- hospital capacity -> red message when overloaded

Population variables:
- population, percent social distancing, degree of hygiene, crowded areas checkbox */


// Define Particle class
class Particle {
// initialize starting attributes
  constructor(){
    this.x = random(0,width);
    this.y = random(0,height);
    this.r = random(6,8);
    this.xSpeed = random(-2,2);
    this.ySpeed = random(-1,1.5);
    this.infected = false;
    this.dead = false;
    this.exposure = 1;
    this.timeSick = 0;
    this.immune = false;
    this.distancing = false;
  }

// creation of a particle.
  createParticle() {
    noStroke();
    if (this.dead == true) {
      fill('rgba(79, 79, 79,1)'); 
    } else if (this.immune == true) {
      fill('rgba(164, 195, 222,1)');
    } else if (this.infected == true) {
      fill('rgba(250,120,120,1)');
    } else {
      fill('rgba(134, 209, 139,1)');
    }
    circle(this.x,this.y,this.r);
  }

// normal particle motion
  moveParticle() {

    if(this.x < 0 || this.x > width)
      this.xSpeed*=-1;
    if(this.y < 0 || this.y > height)
      this.ySpeed*=-1;
    this.x+=this.xSpeed;
    this.y+=this.ySpeed;
  }

}





// an array to add multiple particles
let particles = [];
var infectionRadius = 15;

function start_distancing(amount) {
  for(let m = 0; m<particles.length;m++) {
    particles[m].distancing = false;
  }
  
  for(let m = 0; m<particles.length * 0.01 * amount;m++) {
    particles[m].distancing = true;
  }
}

function resetsim() {
  particles.length = 0;
  frameCount = 0;
  vaxcount = 0;
}

function newSim() {
  newsize = document.getElementById("popsize").value;
  if (newsize != particles.length) {
    if (newsize < particles.length) {
      particles.length = newsize;
    }
    else if (newsize > particles.length){
      for(let i = particles.length;i<newsize;i++){
        particles.push(new Particle());
      }
    }
  }
}

var infect_count;
var recovered_count;
var normal_count;
var dead_count;

function tally() {

  infect_count = 0;
  recovered_count = 0;
  normal_count = 0;
  dead_count = 0;
  /// Do counters
  for (var i = 0; i < particles.length; i++) {
    var curr = particles[i];
    if (curr.dead == true) {
      dead_count = dead_count + 1;

    } else if (curr.immune == true) {
      recovered_count += 1;
      
    }  else if (curr.infected == true) {
      infect_count += 1;
      
    } else {
      normal_count += 1;  
    }
  }

  document.getElementById("lbl1").innerHTML = "Dead: " + dead_count;
  document.getElementById("lbl2").innerHTML = "Immune/Recovered: " + recovered_count;
  document.getElementById("lbl3").innerHTML = "Infected: " + infect_count;
  document.getElementById("lbl4").innerHTML = "Susceptible: " + normal_count;
}



function setup() {
  createCanvas(window.innerWidth * 0.85, window.innerHeight*0.98);
  frameRate(60);
}

var vaxcount = 0;
function draw() {
  background('#0f0f0f');
  newSim();

  infectrate = document.getElementById("infectrate").value;
  deathrate = document.getElementById("deathrate").value;
  vaxrate = int(document.getElementById("vaxrate").value * 0.01 * particles.length) - 1;
  vaxspeed = document.getElementById("vaxspeed").value;
  
  
  for(let m = 0; m<particles.length;m++) {
    particles[m].createParticle();
    particles[m].moveParticle();
    
	  //particles infect eachother if come in contact in the "infectionRadius"
    for (var i = 0; i < particles.length; i++) {
      if (particles[m].distancing == true) {
        if (int(dist(particles[m].x, particles[m].y, particles[i].x, particles[i].y)) == 30) {
          particles[m].ySpeed *= -1;
          particles[m].xSpeed *= -1;
        }
      }


      
      if (particles[m].infected == true) {
        if ( abs(particles[m].x - particles[i].x) < 20 && abs(particles[m].y - particles[i].y) < 50) {
          if (particles[i].immune == false && particles[i].dead == false) {
            if (random(0,100) < int(infectrate * particles[i].exposure)  &&  frameCount%8 == 0) {
        			if (dist(particles[m].x, particles[m].y,
        		particles[i].x, particles[i].y) <= infectionRadius) {
                particles[i].infected = true;
        		  }
            }
          }
        }
  		}
    }


    //Calculate recovery time and death
    if (particles[m].infected == true) {
      if (particles[m].timeSick == 300) {
        particles[m].immune = true;
        particles[m].infected = false;
        if (random(0,100) < deathrate) {
          particles[m].dead = true;
          particles[m].immune = false;
        }
      }
      particles[m].timeSick += 1;   
    }
  }

  if (frameCount == 100) {
		particles[9].infected = true; //after 100 frameCount, one dot becomes sick
	}
  
  tally();
  
  tempvaxcount = vaxcount;
  if (tempvaxcount < vaxrate && frameCount%int(1/vaxspeed) == 0 && particles[tempvaxcount].infected == false && infect_count > 0) {
    particles[tempvaxcount].immune = true;
    particles[tempvaxcount].exposure = 0.3;
    vaxcount = vaxcount + 1;
  }

}
