
const WIDTH = 400
const HEIGHT = 400
const DELAY = 20
const DIAGONAL = Math.sqrt( Math.pow(WIDTH/2, 2) + Math.pow(HEIGHT/2, 2) )

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.width = WIDTH
canvas.height = HEIGHT
const ctx = canvas.getContext('2d')

const player = {
	active: true,
	position: {
		x: WIDTH/2,
		y: HEIGHT/2
	},
	radius: 10,
	angle: 0,
	angleVelocity: 0,
	angleFixedVelocity: 2,
	velocity: 0,
	fixedVelocity: 2,
	shotOnce: false,
	shots: [],
	shotSpeed: 6,
	shotRadius: 1,
	asteroids: [],
	asteroidMaxSpeed: 2.3,
	asteroidMinSpeed: 0.2,
	asteroidMaxRadius: 20,
	asteroidMinRadius: 8,
	asteroidSpawnChance: 0,
	asteroidSides: 7,
	asteroidImperfection: 4,
	score: 0
}

function restart() {
	player.asteroids = []
	player.shots = []
	player.active = true
	player.position.x = WIDTH/2
	player.position.y = HEIGHT/2
	player.asteroidSpawnChance = 0.99
	player.angle = 0
	player.score = 0
}

function shot() {
	player.shots.push({
		x: player.position.x + Math.cos(player.angle)*player.radius,
		y: player.position.y + Math.sin(player.angle)*player.radius,
		angle: player.angle,
		active: true
	})
}

function spawnAsteroid() {
	const angle = Math.random() * Math.PI*2
	const radius = Math.random() * (player.asteroidMaxRadius-player.asteroidMinRadius) + player.asteroidMinRadius
	const x = WIDTH/2 + Math.cos(angle) * DIAGONAL
	const y = HEIGHT/2 + Math.sin(angle) * DIAGONAL

	const g = []
	for (let i = 0; i < player.asteroidSides; i++) {
		g.push(radius - Math.random()*player.asteroidImperfection )
	}

	player.asteroids.push({
		x, y,
		angle: Math.PI + Math.atan2(y - player.position.y, x - player.position.x),
		active: true,
		radius,
		speed: Math.random() *  (player.asteroidMaxSpeed-player.asteroidMinSpeed) + player.asteroidMinSpeed,
		g
	})
}

function update() {
	if (player.active) {
		player.angle += player.angleVelocity * player.angleFixedVelocity

		if (player.velocity != 0) {
			player.position.x += Math.cos(player.angle) * player.fixedVelocity
			player.position.y += Math.sin(player.angle) * player.fixedVelocity
		}

		player.shots.forEach(shot => {
			if (shot.active) {
				shot.x += Math.cos(shot.angle) * player.shotSpeed
				shot.y += Math.sin(shot.angle) * player.shotSpeed

				if ( Math.sqrt( Math.pow(shot.x - WIDTH/2, 2) + Math.pow(shot.y - HEIGHT/2, 2) ) > DIAGONAL )
					shot.active = false
			}
		})
	}

	player.asteroids.forEach(asteroid => {
		if (asteroid.active) {
			asteroid.x += Math.cos(asteroid.angle) * asteroid.speed
			asteroid.y += Math.sin(asteroid.angle) * asteroid.speed

			if ( Math.sqrt( Math.pow(asteroid.x - WIDTH/2, 2) + Math.pow(asteroid.y - HEIGHT/2, 2) ) > DIAGONAL)
				asteroid.active = false
		}

		if (player.active) {
			if (
				Math.sqrt( Math.pow(player.position.x + Math.cos(player.angle)*player.radius - asteroid.x, 2) + Math.pow(player.position.y + Math.sin(player.angle)*player.radius - asteroid.y, 2) ) < player.radius*2 &&
				Math.sqrt( Math.pow(player.position.x + Math.cos(player.angle)*player.radius/3*2 - asteroid.x, 2) + Math.pow(player.position.y + Math.sin(player.angle)*player.radius/3*2 - asteroid.y, 2) ) < player.radius*2 &&
				Math.sqrt( Math.pow(player.position.x + Math.cos(player.angle)*player.radius/3*4 - asteroid.x, 2) + Math.pow(player.position.y + Math.sin(player.angle)*player.radius/3*4 - asteroid.y, 2) ) < player.radius*2
			) {
				player.active = false
			}
		}

		player.shots.forEach(shot => {
			if ( Math.sqrt( Math.pow( shot.x - asteroid.x, 2) + Math.pow( shot.y - asteroid.y, 2 ) ) < asteroid.radius + player.shotRadius ) {
				asteroid.active = false
				shot.active = false
				player.score++
				player.asteroidSpawnChance -= 0.002
			}
		})
	})

	player.shots = player.shots.filter(({active}) => active)
	player.asteroids = player.asteroids.filter(({active}) => active)

	if (Math.random() > player.asteroidSpawnChance)
		spawnAsteroid()
}

function draw() {
	ctx.clearRect(0,0,WIDTH,HEIGHT)
	ctx.fillStyle = 'black'
	ctx.fillRect(0,0,WIDTH,HEIGHT)

	ctx.fillStyle = '#111111'

	ctx.textBaseline = 'middle'
	ctx.textAlign = 'center'
	ctx.font = '120px Arial'
	ctx.fillText(player.score, WIDTH/2, HEIGHT/2)

	ctx.strokeStyle = 'white'
	ctx.fillStyle = 'white'

	if (player.active) {
		ctx.beginPath()
		ctx.moveTo( player.position.x + Math.cos(player.angle)*player.radius, player.position.y + Math.sin(player.angle)*player.radius )
		ctx.lineTo( player.position.x + Math.cos(player.angle+Math.PI/3*2)*player.radius, player.position.y + Math.sin(player.angle+Math.PI/3*2)*player.radius )
		ctx.lineTo( player.position.x + Math.cos(player.angle)*-player.radius/6, player.position.y + Math.sin(player.angle)*-player.radius/6 )
		ctx.lineTo( player.position.x + Math.cos(player.angle+Math.PI/3*4)*player.radius, player.position.y + Math.sin(player.angle+Math.PI/3*4)*player.radius )
		ctx.lineTo( player.position.x + Math.cos(player.angle)*player.radius, player.position.y + Math.sin(player.angle)*player.radius )
		ctx.stroke()

		player.shots.forEach(shot => {
			if (shot.active) {
				ctx.beginPath()
				ctx.arc( shot.x, shot.y, player.shotRadius, 0, Math.PI*2 )
				ctx.fill()
			}
		})
	}

	player.asteroids.forEach(asteroid => {
		if (asteroid.active) {
			ctx.beginPath()
			// ctx.arc( asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI*2 )
			ctx.moveTo( asteroid.x + Math.cos(0)*asteroid.g[0],  asteroid.y + Math.sin(0)*asteroid.g[0]  )
			for (let i = 1; i < player.asteroidSides; i++)
				ctx.lineTo( asteroid.x + Math.cos(Math.PI*2/player.asteroidSides*i)*asteroid.g[i],  asteroid.y + Math.sin(Math.PI*2/player.asteroidSides*i)*asteroid.g[i]  )
			ctx.lineTo( asteroid.x + Math.cos(0)*asteroid.g[0],  asteroid.y + Math.sin(0)*asteroid.g[0]  )
			ctx.stroke()
		}
	})
}

document.addEventListener('keydown', ev => {
	switch(ev.key) {
		case "a":
			player.angleVelocity = -0.1
			break

		case "d":
			player.angleVelocity = 0.1
			break

		case "w":
			player.velocity = 1
			break

		case "Escape":
			restart()
			break

		case " ":
			if (!player.shotOnce) {
				player.shotOnce = true
				shot()
			}
			break	
	}
})

document.addEventListener('keyup', ev => {
	switch(ev.key) {
		case "a":
			player.angleVelocity = 0
			break

		case "d":
			player.angleVelocity = 0
			break

		case "w":
			player.velocity = 0
			break

		case " ":
			player.shotOnce = false
			break	
	}
})

function loop() {
	update()
	draw()
	setTimeout(() => requestAnimationFrame(loop), DELAY)
}
restart()
loop()