import { Canvas, useFrame } from '@react-three/fiber'
import { useState, useCallback, useEffect, useRef, forwardRef } from 'react'
import { Box, OrbitControls, Grid, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Physics, useBox } from '@react-three/cannon'

const GRAVITY = -0.008
const JUMP_FORCE = 0.15
const OBSTACLE_SPEED = 0.05
const OBSTACLE_GAP = 2
const OBSTACLE_SPAWN_INTERVAL = 2000
const SCORE_INTERVAL = 1000

function SpaceBackground() {
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  )
}

function Boundaries() {
  return (
    <>
      {/* Ceiling */}
      <Box position={[0, 2.5, 0]} args={[10, 0.1, 1]}>
        <meshStandardMaterial color="red" transparent opacity={0.5} />
      </Box>
      {/* Floor */}
      <Box position={[0, -2.5, 0]} args={[10, 0.1, 1]}>
        <meshStandardMaterial color="red" transparent opacity={0.5} />
      </Box>
    </>
  )
}

const Spaceship = forwardRef(({ position }, ref) => {
  const meshRef = useRef()
  const velocity = useRef(0)

  useEffect(() => {
    if (ref) {
      ref.current = {
        jump: () => {
          console.log('Jump called')
          velocity.current = JUMP_FORCE
        },
        getPosition: () => meshRef.current.position.y,
        setPosition: (y) => {
          meshRef.current.position.y = y
        }
      }
    }
  }, [ref])

  useFrame(() => {
    if (meshRef.current) {
      velocity.current += GRAVITY
      meshRef.current.position.y += velocity.current

      if (meshRef.current.position.y < -2.5 || meshRef.current.position.y > 2.5) {
        meshRef.current.position.y = Math.max(-2.5, Math.min(2.5, meshRef.current.position.y))
        velocity.current = 0
      }
    }
  })

  return (
    <group ref={meshRef} position={position} rotation={[0, 0, Math.PI * 1.5]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Black and white stripes */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.15, 0.3, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Fins */}
      {[0, 90, 180, 270].map((rotation, index) => (
        <mesh key={index} position={[0, -0.35, 0]} rotation={[0, 0, rotation * Math.PI / 180]}>
          <boxGeometry args={[0.1, 0.2, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Engine bell */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Exhaust effect */}
      <mesh position={[0, -0.55, 0]}>
        <coneGeometry args={[0.15, 0.2, 16]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
})

function Obstacle({ x, gapY }) {
  const geometry = createAsteroidGeometry()
  
  return (
    <>
      {/* Top asteroid */}
      <group position={[x, gapY + OBSTACLE_GAP / 2 + 1, 0]}>
        <pointLight position={[1, 1, 1]} intensity={1.5} distance={3} />
        <pointLight position={[-1, -1, -1]} intensity={0.5} distance={3} color="#4040ff" />
        <mesh>
          <primitive object={geometry} />
          <meshStandardMaterial 
            color="#707070"
            roughness={0.7}
            metalness={0.3}
            emissive="#303030"
            emissiveIntensity={0.1}
            flatShading={true}
          />
        </mesh>
      </group>
      
      {/* Bottom asteroid */}
      <group position={[x, gapY - OBSTACLE_GAP / 2 - 1, 0]}>
        <pointLight position={[1, 1, 1]} intensity={1.5} distance={3} />
        <pointLight position={[-1, -1, -1]} intensity={0.5} distance={3} color="#4040ff" />
        <mesh>
          <primitive object={geometry} />
          <meshStandardMaterial 
            color="#707070"
            roughness={0.7}
            metalness={0.3}
            emissive="#303030"
            emissiveIntensity={0.1}
            flatShading={true}
          />
        </mesh>
      </group>
    </>
  )
}

function createAsteroidGeometry() {
  const geometry = new THREE.OctahedronGeometry(0.8, 2)
  const positions = geometry.attributes.position
  
  // Create more pronounced surface features
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const z = positions.getZ(i)
    
    // Create deep craters and sharp features
    const crater = Math.sin(x * 15) * Math.sin(y * 15) * Math.sin(z * 15) * 0.3
    const sharp = Math.abs(Math.sin(x * 30)) * Math.abs(Math.sin(y * 30)) * 0.2
    
    positions.setXYZ(
      i,
      x + crater + sharp,
      y + crater + sharp,
      z + crater + sharp
    )
  }
  
  geometry.computeVertexNormals()
  return geometry
}

function Game({ score, gameOver, onScoreChange, onGameOver }) {
  const [obstacles, setObstacles] = useState([])
  const spaceshipRef = useRef()
  const lastObstacleRef = useRef(null)

  // Reset game state
  const resetGame = useCallback(() => {
    setObstacles([])
    if (spaceshipRef.current) {
      spaceshipRef.current.setPosition(0)
    }
    lastObstacleRef.current = null
  }, [])

  // Handle key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameOver) {
          resetGame()
          onGameOver(false)
        } else if (spaceshipRef.current) {
          spaceshipRef.current.jump()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, resetGame, onGameOver])

  // Spawn obstacles
  useEffect(() => {
    if (gameOver) return

    const spawnObstacle = () => {
      const gapY = Math.random() * 2 - 1
      setObstacles(prev => [...prev, { x: 5, gapY }])
    }

    const interval = setInterval(spawnObstacle, OBSTACLE_SPAWN_INTERVAL)
    return () => clearInterval(interval)
  }, [gameOver])

  // Update obstacles and check collisions
  useFrame(() => {
    if (gameOver) return

    setObstacles(prev => {
      const newObstacles = prev
        .map(obs => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
        .filter(obs => obs.x > -6)

      // Check if spaceship passed through an obstacle
      const spaceshipX = -4 // Fixed x position of spaceship
      newObstacles.forEach(obs => {
        if (obs.x < spaceshipX && obs.x + OBSTACLE_SPEED >= spaceshipX) {
          // Only increment score if this is a new obstacle (not the last one we counted)
          if (lastObstacleRef.current !== obs) {
            onScoreChange(score + 1)
            lastObstacleRef.current = obs
          }
        }
      })

      return newObstacles
    })

    // Check collisions
    if (spaceshipRef.current) {
      const spaceshipY = spaceshipRef.current.getPosition()
      const spaceshipX = -4 // Fixed x position of spaceship

      obstacles.forEach(obs => {
        if (Math.abs(obs.x - spaceshipX) < 0.5) {
          if (Math.abs(spaceshipY - obs.gapY) > OBSTACLE_GAP / 2) {
            onGameOver(true)
          }
        }
      })
    }
  })

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      <Spaceship ref={spaceshipRef} position={[-4, 0, 0]} />
      {obstacles.map((obs, i) => (
        <Obstacle key={i} x={obs.x} gapY={obs.gapY} />
      ))}
      <Boundaries />
    </>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const handleScoreChange = useCallback((newScore) => {
    setScore(newScore)
  }, [])

  const handleGameOver = useCallback((isGameOver) => {
    setGameOver(isGameOver)
    if (isGameOver) {
      setScore(0)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Physics>
          <Game 
            score={score}
            gameOver={gameOver}
            onScoreChange={handleScoreChange}
            onGameOver={handleGameOver}
          />
        </Physics>
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        Score: {score}
      </div>
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '48px',
          fontFamily: 'Arial',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          Game Over! Press Space to Restart
        </div>
      )}
    </div>
  )
}

export default App
