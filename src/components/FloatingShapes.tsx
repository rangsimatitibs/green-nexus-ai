import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const OrbitingCircle = ({ 
  radius, 
  orbitRadius, 
  speed, 
  offset, 
  size 
}: { 
  radius: number; 
  orbitRadius: number; 
  speed: number; 
  offset: number;
  size: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed + offset;
    
    // Orbit in a circular path
    meshRef.current.position.x = Math.cos(time) * orbitRadius;
    meshRef.current.position.y = Math.sin(time) * orbitRadius * 0.5;
    meshRef.current.position.z = Math.sin(time) * orbitRadius * 0.3;
    
    // Gentle rotation
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color="#5eead4" 
        transparent 
        opacity={0.4}
        emissive="#5eead4"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const FloatingShapes = () => {
  const circles = [
    { radius: 0.5, orbitRadius: 8, speed: 0.3, offset: 0, size: 0.8 },
    { radius: 0.3, orbitRadius: 6, speed: 0.4, offset: 1, size: 0.5 },
    { radius: 0.4, orbitRadius: 10, speed: 0.25, offset: 2, size: 0.6 },
    { radius: 0.6, orbitRadius: 7, speed: 0.35, offset: 3, size: 1.0 },
    { radius: 0.3, orbitRadius: 9, speed: 0.28, offset: 4, size: 0.4 },
    { radius: 0.5, orbitRadius: 5, speed: 0.45, offset: 5, size: 0.7 },
    { radius: 0.4, orbitRadius: 11, speed: 0.2, offset: 1.5, size: 0.6 },
    { radius: 0.3, orbitRadius: 6.5, speed: 0.38, offset: 2.5, size: 0.5 },
    { radius: 0.7, orbitRadius: 8.5, speed: 0.32, offset: 3.5, size: 1.2 },
    { radius: 0.2, orbitRadius: 7.5, speed: 0.42, offset: 4.5, size: 0.3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2dd4bf" />
        {circles.map((circle, index) => (
          <OrbitingCircle key={index} {...circle} />
        ))}
      </Canvas>
    </div>
  );
};

export default FloatingShapes;
