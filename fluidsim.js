let N = 64;
let SCALE = 10;
let canvasWidth = N * SCALE;
let canvasHeight = N * SCALE;
let bgColor = 'black';
let origDiff = 0;
let origVisc = 0.000001;
let dt = 0.01;
let iter = 4;
let sq;
let t = 0;

function IX(x, y) {
    x = constrain(x, 0, N-1);
    y = constrain(y, 0, N-1);
    return x + y * N;
}

class FluidSquare {
    constructor(size, diffusion, viscosity, dt) {
        this.size = size;
        this.diff = diffusion;
        this.visc = viscosity;
        this.dt = dt;

        this.s = new Array(N*N).fill(0);
        this.density = new Array(N*N).fill(0);

        this.Vx = new Array(N*N).fill(0);
        this.Vy = new Array(N*N).fill(0);

        this.Vx0 = new Array(N*N).fill(0);
        this.Vy0 = new Array(N*N).fill(0);
    }

    step() {
        let visc     = this.visc;
        let diff     = this.diff;
        let dt       = this.dt;
        let Vx      = this.Vx;
        let Vy      = this.Vy;
        let Vx0     = this.Vx0;
        let Vy0     = this.Vy0;
        let s       = this.s;
        let density = this.density;
        
        diffuse(1, Vx0, Vx, visc, dt, iter);
        diffuse(2, Vy0, Vy, visc, dt, iter);
        
        project(Vx0, Vy0, Vx, Vy, iter);
        
        advect(1, Vx, Vx0, Vx0, Vy0, dt);
        advect(2, Vy, Vy0, Vx0, Vy0, dt);
        
        project(Vx, Vy, Vx0, Vy0, iter);
        
        diffuse(0, s, density, diff, dt, iter);
        advect(0, density, s, Vx, Vy, dt);
    }

    addDensity(x, y, amt) {
        let idx = IX(x, y);
        this.density[idx] += amt;
    }

    addVelocity(x, y, amtX, amtY) {
        let idx = IX(x, y);
        this.Vx[idx] += amtX;
        this.Vy[idx] += amtY;
    }

    renderD() {
        for(let i = 0; i < N; i++) {
            for(let j = 0; j < N; j++) {
                let x = i * SCALE;
                let y = j * SCALE;
                let d = this.density[IX(i,j)];
                fill(255, d);
                noStroke();
                rect(x, y, SCALE, SCALE)
            }
        }
    }

    fadeD() {
        for(let i = 0; i < this.density.length; i++) {
            let d = this.density[i];
            this.density[i] = constrain(d-0.1, 0, 255);
        }
    }
}

function mouseDragged() {
    sq.addDensity(floor(mouseX/SCALE), floor(mouseY/SCALE), 200);
    let amtX = mouseX - pmouseX;
    let amtY = mouseY - pmouseY;
    sq.addVelocity(floor(mouseX/SCALE), floor(mouseY/SCALE), amtX, amtY);
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    sq = new FluidSquare(canvasWidth, origDiff, origVisc, dt);
}

function draw() {
    background(0);

    let cx = .5*canvasWidth/SCALE;
    let cy = .5*canvasHeight/SCALE;
    sq.addDensity(cx, cy, 500);
    let n = map(noise(t), 0, 1, -1, 1);
    // if(n < .5) n += .3;
    // console.log(n);
    let angle = TWO_PI * n;
    console.log(n)
    let v = p5.Vector.fromAngle(angle);
    v.mult(6);
    // let amtX = map(noise(t), 0, 1, -1, 1);
    // let amtY = map(noise(t+1000), 0, 1, -1, 1);
    t += 0.01;
    sq.addVelocity(cx, cy, v.x, v.y);

    sq.step();
    sq.renderD();
    sq.fadeD();
}