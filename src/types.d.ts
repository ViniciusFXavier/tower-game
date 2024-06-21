interface IGame {
  enemies: IEnemy[];
  bullets: IBullet[];
  wave: number;
  kills: number;
  startTime: number;
}

interface IUtils {
  getDistance(x1: number, y1: number, x2: number, y2: number): number;
}

interface ICannon {
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
  spawnBullet(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  findClosestEnemy(enemies: IEnemy[]): IEnemy | null;
}

interface CannonProps {
  x: number,
  y: number,
  rotation: number,
  heafth: number,
  maxHeafth: number,
  color: string,
  maxRange: number,
  state: 'idle' | 'shooting'
}

interface IEnemy {
  x: number;
  y: number;
  radius: number;
  angle: number;
  type: string;
  color: string;
  health: number;
  damage: number;
  speed: number;
  isCollidingWith(bullet: IBullet): boolean;
  takeDamage(damage: number): void;
  moveTowardsCannon(cannon: ICannon): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface EnemyProps {
  x: number,
  y: number,
  radius: number;
  angle: number,
  type: string,
  color: string;
  health: number,
  damage: number,
  speed: number
}

interface IBullet {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  maxDistance: number;
  distanceTraveled: number;
  updatePosition(): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface BulletProps {
  x: number,
  y: number,
  radius: number;
  angle: number,
  speed: number,
  maxDistance: number
}
