import React, { useEffect, useRef } from 'react';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    class Game implements IGame {
      enemies: IEnemy[];
      bullets: IBullet[];
      wave: number;
      kills: number;
      startTime: number;
      enemiesPerWave: number;
      enemiesSpawned: number;
      currentEnemyType: "square" | "circle" | "triangle"
      fireRate: number;
      lastFireTime: number;

      constructor() {
        this.enemies = [];
        this.bullets = [];
        this.wave = 0;
        this.kills = 0;
        this.startTime = Date.now();
        this.enemiesPerWave = 10
        this.enemiesSpawned = 0
        this.currentEnemyType = 'square'
        this.fireRate = 100;
        this.lastFireTime = 0;

        this.startWave()
      }

      startWave() {
        this.wave += 1;
        this.changeEnemyType();
        const enemiesToSpawn = Math.floor(this.wave * 10);
        if (enemiesToSpawn <= 1) {
          this.spawnEnemy(this.currentEnemyType);
          return;
        }

        let interval = 30 / (enemiesToSpawn - 1);

        for (let i = 0; i < enemiesToSpawn; i++) {
          setTimeout(() => this.spawnEnemy(this.currentEnemyType), i * interval * 1000);
        }

        setTimeout(() => this.startWave(), 30 * 1000);

        if (this.wave % 3 === 0) {
          setTimeout(() => {
            this.spawnEnemy('boss');
          }, 30000);
        }
      }

      changeEnemyType() {
        const enemyTypes = ['square', 'circle', 'triangle'] as const;
        this.currentEnemyType = enemyTypes[(enemyTypes.indexOf(this.currentEnemyType) + 1) % enemyTypes.length];
      };

      spawnEnemy = (type: 'square' | 'circle' | 'triangle' | 'boss' = 'circle') => {
        const spawDistance = 400;
        const color = type === 'boss' ? 'purple' : 'red';
        const sizeMultiplier = type === 'boss' ? 3 : 1;
        const health = type === 'boss' ? 100 * sizeMultiplier : 100;
        const damage = type === 'boss' ? 30 * sizeMultiplier : 10;
        const speed = type === 'boss' ? 0.2 : 1;
        const radius = type === 'boss' ? 30 : 10;

        const angleDegrees = Math.random() * 360;
        const angleRadians = angleDegrees * (Math.PI / 180);

        const x = cannon.x + Math.cos(angleRadians) * spawDistance;
        const y = cannon.y + Math.sin(angleRadians) * spawDistance;

        const enemy = new Enemy({
          x,
          y,
          radius,
          angle: angleDegrees,
          type,
          color,
          health,
          damage,
          speed,
        });

        game.enemies.push(enemy);
      };

      updateBullets(ctx: CanvasRenderingContext2D) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
          const bullet = this.bullets[i];
          bullet.updatePosition();
          bullet.draw(ctx);

          for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (enemy.isCollidingWith(bullet)) {
              enemy.takeDamage(10);
              this.bullets.splice(i, 1);
              if (enemy.health <= 0) {
                this.enemies.splice(j, 1);
              }
              break;
            }
          }

          if (bullet.distanceTraveled >= bullet.maxDistance) {
            this.bullets.splice(i, 1);
          }
        }
      }

      updateCannon(ctx: CanvasRenderingContext2D) {
        if (cannon.targetRotation) {
          let rotationDifference = cannon.targetRotation - cannon.rotation;

          if (Math.abs(rotationDifference) > 180) {
            rotationDifference = -Math.sign(rotationDifference) * (360 - Math.abs(rotationDifference));
          }

          const rotationSpeed = 10;

          if (Math.abs(rotationDifference) < rotationSpeed) {
            cannon.rotation = cannon.targetRotation;
          } else {
            cannon.rotation += Math.sign(rotationDifference) * rotationSpeed;
          }

          if (cannon.rotation >= 360) {
            cannon.rotation -= 360;
          } else if (cannon.rotation < 0) {
            cannon.rotation += 360;
          }
        } else {
          const closestEnemy = cannon.findClosestEnemy(game.enemies);
          if (closestEnemy) {
            let enemyTargetRotation = closestEnemy.angle + 90;
            if (enemyTargetRotation > 360) {
              enemyTargetRotation -= 360;
            } else if (enemyTargetRotation < 0) {
              enemyTargetRotation += 360;
            }

            let rotationDifference = enemyTargetRotation - cannon.rotation;

            if (Math.abs(rotationDifference) > 180) {
              rotationDifference = -Math.sign(rotationDifference) * (360 - Math.abs(rotationDifference));
            }

            const rotationSpeed = 2;

            if (Math.abs(rotationDifference) < rotationSpeed) {
              cannon.rotation = enemyTargetRotation;
            } else {
              cannon.rotation += Math.sign(rotationDifference) * rotationSpeed;
            }

            if (cannon.rotation >= 360) {
              cannon.rotation -= 360;
            } else if (cannon.rotation < 0) {
              cannon.rotation += 360;
            } else {
            }

            if (cannon.rotation === enemyTargetRotation) {
              const currentTime = Date.now();
              if (currentTime - this.lastFireTime >= this.fireRate) {
                cannon.spawnBullet();
                this.lastFireTime = currentTime;
              }
            }
          }
        }

        cannon.draw(ctx);
      }

      updateEnemys(ctx: CanvasRenderingContext2D) {
        for (let enemyIndex = game.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
          let enemy = game.enemies[enemyIndex];
          if (Math.abs(enemy.x - cannon.x) < 10 && Math.abs(enemy.y - cannon.y) < 10) {
            game.enemies.splice(enemyIndex, 1);
            cannon.heafth -= enemy.damage;
          } else {
            enemy.moveTowardsCannon(cannon);
            enemy.draw(ctx);
          }
        }
      }

      updateInterface(ctx: CanvasRenderingContext2D) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);

        ctx.fillStyle = 'white';
        ctx.font = '15px Arial';
        ctx.fillText(`Wave: ${this.wave}`, 10, 15);
        ctx.fillText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 10, 30);
        ctx.fillText(`Kills: ${this.kills}`, 10, 45);
      }

      updateGame(ctx: CanvasRenderingContext2D) {
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.updateEnemys(ctx);
        this.updateBullets(ctx);
        this.updateCannon(ctx);
        this.updateInterface(ctx);
      };
    }

    const game = new Game()

    class Cannon implements ICannon {
      x: number;
      y: number;
      rotation: number;
      heafth: number;
      maxHeafth: number;
      percent: number;
      color: string;
      maxRange: number
      state: 'idle' | 'shooting';
      lastState: 'idle' | 'shooting';
      targetRotation: number | null;
      mouseDown: boolean;

      constructor({
        rotation,
        heafth,
        maxHeafth,
        color,
        maxRange,
        state
      }: CannonProps) {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.rotation = rotation;
        this.heafth = heafth;
        this.maxHeafth = maxHeafth;
        this.percent = 100;
        this.color = color || 'white';
        this.maxRange = maxRange;
        this.state = state;
        this.lastState = 'idle';

        this.mouseDown = false;
        this.targetRotation = null;
        this.setupMouseListeners();
      };

      getDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      }

      findClosestEnemy(enemies: IEnemy[]): IEnemy | null {
        if (enemies.length === 0) return null;

        let closestEnemy = enemies[0];
        let closestDistance = this.getDistance(this.x, this.y, enemies[0].x, enemies[0].y);

        for (let enemy of enemies) {
          let distance = this.getDistance(this.x, this.y, enemy.x, enemy.y);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
          }
        }
        return closestEnemy;
      }

      moveToTargetRotation(event: { clientX: number; clientY: number; }) {
        if (!canvas) return
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const angle = Math.atan2(mouseY - cannon.y, mouseX - cannon.x) * 180 / Math.PI;
        this.targetRotation = (angle + 90 + 360) % 360; // Adjust to your rotation system
      }

      draw(ctx: CanvasRenderingContext2D) {
        const x = this.x = window.innerWidth / 2;
        const y = this.y = window.innerHeight / 2;
        const rotation = this.rotation;
        const maxRange = this.maxRange
        this.percent = (this.heafth - this.maxHeafth / 100) + 1;

        const drawBase = () => {
          const radius = 44;
          const lineWidth = 5;

          let startAngle = -0.5 * Math.PI;
          let endAngle = 0;

          const circleColor = '#000';
          const progressColor = 'rgba(80, 80, 80, 0.8)';

          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = circleColor;
          ctx.lineWidth = lineWidth;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fill();
          ctx.stroke();

          endAngle = -0.5 * Math.PI + (this.percent / 100) * (2 * Math.PI);
          ctx.beginPath();
          ctx.arc(x, y, radius, startAngle, endAngle);
          ctx.strokeStyle = progressColor;
          ctx.stroke();
        }
        drawBase();

        const drawCannon = () => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);

          const baseWidth = 40;
          const baseHeight = 15;
          const subBaseWidth = 28;
          const subBaseHeight = 24;
          const barrelWidth = 4;
          const barrelHeight = 57;
          const barrelDetailsWidth = 32;
          const barrelDetailsHeight = 5;

          ctx.fillStyle = this.color;
          ctx.fillRect(-baseWidth / 2, -baseHeight / 2 - 5, baseWidth, baseHeight);
          ctx.fillRect(-subBaseWidth / 2, 1, subBaseWidth, subBaseHeight);

          ctx.fillRect(-barrelDetailsWidth / 2, -baseHeight - barrelHeight - barrelDetailsHeight + 15, barrelDetailsWidth, barrelDetailsHeight);
          ctx.fillRect(-barrelDetailsWidth / 2, -baseHeight - barrelHeight - barrelDetailsHeight + 25, barrelDetailsWidth, barrelDetailsHeight);

          const idle = () => {
            ctx.fillRect(-barrelWidth / 2, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
            ctx.fillRect(-barrelWidth / 2 + 8, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
            ctx.fillRect(-barrelWidth / 2 - 8, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
          };

          const shooting = () => {
            ctx.fillRect(-barrelWidth / 2 - 4, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
            ctx.fillRect(-barrelWidth / 2 + 4, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
            ctx.fillRect(-14, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
            ctx.fillRect(10, -baseHeight - barrelHeight / 2 - 25, barrelWidth, barrelHeight);
          };

          if (this.state === 'idle') {
            idle();
          } else if (this.state === 'shooting') {
            if (this.lastState === 'shooting') {
              shooting();
              this.lastState = 'idle';
            } else {
              idle();
              this.lastState = 'shooting';
            }
          }

          ctx.restore();
        }
        drawCannon();

        const drawAimArea = () => {
          ctx.beginPath();
          ctx.arc(x, y, maxRange, 0, 2 * Math.PI);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.setLineDash([40, 52]);
          ctx.stroke();

          ctx.setLineDash([]);
        }
        drawAimArea()
      }

      setupMouseListeners = () => {
        if (!canvas) return;
        const fireRate = 100; // taxa de disparo em milissegundos (ex: 100ms)

        let fireInterval: NodeJS.Timeout | null = null;

        const startFiring = (event: MouseEvent) => {
          this.state = 'shooting';
          this.mouseDown = true;
          this.moveToTargetRotation(event);
          this.spawnBullet();

          fireInterval = setInterval(() => {
            if (this.mouseDown) {
              this.spawnBullet();
            } else {
              clearInterval(fireInterval!);
              fireInterval = null;
            }
          }, fireRate);
        };

        const stopFiring = () => {
          this.state = 'idle';
          this.mouseDown = false;
          this.targetRotation = null;
          if (fireInterval) {
            clearInterval(fireInterval);
            fireInterval = null;
          }
        };

        const handleMove = (event: { clientX: number; clientY: number; }) => {
          if (this.mouseDown) {
            this.moveToTargetRotation(event);
          }
        }

        // Touch suport - Source: https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
        canvas.addEventListener("touchstart", function (e) {
          var touch = e.touches[0];
          var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvas.dispatchEvent(mouseEvent);
        }, false);
        canvas.addEventListener('touchend', function (e) {
          let mouseEvent = new MouseEvent('mouseup', {});
          canvas.dispatchEvent(mouseEvent);
        }, false);
        canvas.addEventListener('touchmove', function (e) {
          let touch = e.touches[0];
          let mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvas.dispatchEvent(mouseEvent);
        }, false);

        canvas.addEventListener('mousedown', startFiring);
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mouseup', stopFiring);
      };

      spawnBullet() {
        const speed = 15;
        const maxDistance = 250;

        const angleRadians = this.rotation * (Math.PI / 180);
        const angleToReduce = 90 * (Math.PI / 180);

        const startX = this.x + Math.cos(angleRadians) * 0;
        const startY = this.y + Math.sin(angleRadians) * 0;

        const bullet = new Bullet({
          x: startX,
          y: startY,
          radius: 2,
          angle: angleRadians - angleToReduce,
          speed,
          maxDistance
        });

        game.bullets.push(bullet);
      }
    }

    const cannon = new Cannon({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: 'white',
      rotation: 0,
      heafth: 100,
      maxHeafth: 100,
      maxRange: 250,
      state: 'idle',
    });

    class Enemy implements IEnemy {
      x: number;
      y: number;
      radius: number;
      angle: number;
      type: string;
      color: string;
      health: number;
      damage: number;
      speed: number;

      constructor({
        x,
        y,
        radius,
        angle,
        color,
        type,
        health,
        damage,
        speed
      }: EnemyProps) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = angle;
        this.type = type;
        this.color = color;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
      }

      isCollidingWith(bullet: IBullet): boolean {
        const dx = this.x - bullet.x;
        const dy = this.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + bullet.radius;
      }

      takeDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
          this.health = 0;
          game.kills += 1;
        }
      }

      moveTowardsCannon(cannon: ICannon) {
        let angle = Math.atan2(cannon.y - this.y, cannon.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        switch (this.type) {
          case 'square':
            ctx.rect(this.x - 10, this.y - 10, 20, 20);
            break;
          case 'circle':
            ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
            break;
          case 'triangle':
            ctx.moveTo(this.x, this.y - 10);
            ctx.lineTo(this.x - 10, this.y + 10);
            ctx.lineTo(this.x + 10, this.y + 10);
            ctx.closePath();
            break;
          case 'boss':
            ctx.rect(this.x - 30, this.y - 30, 60, 60);
            break;
        }
        ctx.strokeStyle = this.color;
        ctx.stroke();
      }
    }

    class Bullet implements IBullet {
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      maxDistance: number;
      distanceTraveled: number;

      constructor({
        x,
        y,
        radius,
        angle,
        speed,
        maxDistance
      }: BulletProps) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = angle;
        this.speed = speed;
        this.maxDistance = maxDistance;
        this.distanceTraveled = 0;
      }

      updatePosition() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.distanceTraveled += this.speed;

        if (this.distanceTraveled >= this.maxDistance) {
          return true;
        }
        return false;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
      }
    }

    const gameLoop = () => {
      if (!canvas || !ctx) return;
      game.updateGame(ctx);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current!);
      document.body.style.overflow = '';
    };
  }, []);

  return <canvas ref={canvasRef} style={{ backgroundColor: 'grey' }} width={window.innerWidth} height={window.innerHeight} />;
};

export default GameCanvas;
