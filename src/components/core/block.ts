import { Ref } from "vue";
import { position, block } from "../types";

//生成方块
export function createBlock(
  blocks: Ref<block[]>,
  x: position,
  y: position,
  status: number,
  merged: boolean = false,
  visible: boolean = true
) {
  blocks.value.push({
    status,
    position: { x, y },
    merged,
    visible,
    removed: false,
    id: Number(new Date()) + Math.random(),
    trapped: false,
  });
  return blocks.value[blocks.value.length - 1];
}

// 合并方块
export function mergeBlock(
  blocks: Ref<block[]>,
  b1: block,
  b2: block,
  times: number = 1,
  score: Ref<number>,
  newBlock?: block
) {
  if (b1) b1.removed = true;
  if (b2) b2.removed = true;
  if (arguments.length < 6)
    newBlock = createBlock(
      blocks,
      b1.position.x,
      b1.position.y,
      b1.status * 2,
      true,
      false
    );
  let [id1, id2] = [b1 ? b1.id : "", b2 ? b2.id : ""];

  setTimeout(() => {
    if (!b1) b1 = blocks.value.find((value) => value.id === id1);
    if (b1) b1.visible = false;
    if (!b2) b2 = blocks.value.find((value) => value.id === id2);
    if (b2) b2.visible = false;
    newBlock.visible = true;
    if (b1 || b2) score.value += (b1 ? b1.status : b2.status) * times;
  }, 100);

  return newBlock;
}

//自动生成新方块
export function generateBlock(
  blocks: Ref<block[]>,
  difficulty: number,
  position: [number, number] = [
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
  ]
) {
  if (difficulty === 1)
    return createBlock(blocks, <position>position[0], <position>position[1], 2);
  else
    return createBlock(
      blocks,
      <position>position[0],
      <position>position[1],
      Math.pow(2, 1 + Math.floor(Math.random() * 5))
    );
}

// 玩家操作(1,2,3,4分别表示左,上,右,下)
export function move(
  blocks: Ref<block[]>,
  difficulty: number,
  score: Ref<number>,
  move: 1 | 2 | 3 | 4,
  trapped: boolean = false,
  plus?: Ref<[number, number, number][]>
) {
  let matrix: Array<Array<block | null>> = new Array(4);
  let merged: block[][] = [];
  blocks.value = blocks.value.filter(
    (value) =>
      !(
        (value.removed && !value.visible) ||
        (value.removed && Number(new Date()) - Number(value.id) > 500)
      )
  );
  for (let i = 0; i < 4; i++) matrix[i] = new Array(4).fill(null);
  for (const iterator of blocks.value) {
    if (!iterator.removed) {
      if (matrix[iterator.position.y][iterator.position.x] === null)
        matrix[iterator.position.y][iterator.position.x] = iterator;
    }
  }
  let stuck = true;
  switch (move) {
    case 2:
      for (let i = 1; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (matrix[i][j] === null) continue;
          while (
            matrix[i][j].position.y > 0 &&
            matrix[matrix[i][j].position.y - 1][j] === null
          )
            matrix[i][j].position.y--;
          if (
            matrix[i][j].position.y > 0 &&
            matrix[matrix[i][j].position.y - 1][j].status ===
              matrix[i][j].status
          ) {
            matrix[i][j].position.y--;
            merged.push([matrix[i][j], matrix[matrix[i][j].position.y][j]]);
            matrix[matrix[i][j].position.y][j] = {
              status: NaN,
              position: {
                x: j as position,
                y: matrix[i][j].position.y as position,
              },
              visible: false,
              removed: false,
              merged: true,
              trapped: false,
              id: NaN,
            };
          } else matrix[matrix[i][j].position.y][j] = matrix[i][j];
          if (matrix[i][j].position.y !== i) {
            stuck = false;
            matrix[i][j] = null;
          }
        }
      }
      break;
    case 4:
      for (let i = 2; i > -1; i--) {
        for (let j = 0; j < 4; j++) {
          if (matrix[i][j] === null) continue;
          while (
            matrix[i][j].position.y < 3 &&
            matrix[matrix[i][j].position.y + 1][j] === null
          )
            matrix[i][j].position.y++;
          if (
            matrix[i][j].position.y < 3 &&
            matrix[matrix[i][j].position.y + 1][j].status ===
              matrix[i][j].status
          ) {
            matrix[i][j].position.y++;
            merged.push([matrix[i][j], matrix[matrix[i][j].position.y][j]]);
            matrix[matrix[i][j].position.y][j] = {
              status: NaN,
              position: {
                x: j as position,
                y: matrix[i][j].position.y as position,
              },
              merged: true,
              removed: false,
              visible: false,
              trapped: false,
              id: NaN,
            };
          } else matrix[matrix[i][j].position.y][j] = matrix[i][j];
          if (matrix[i][j].position.y !== i) {
            stuck = false;
            matrix[i][j] = null;
          }
        }
      }
      break;
    case 1:
      for (let j = 1; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          if (matrix[i][j] === null) continue;
          while (
            matrix[i][j].position.x > 0 &&
            matrix[i][matrix[i][j].position.x - 1] === null
          )
            matrix[i][j].position.x--;
          if (
            matrix[i][j].position.x > 0 &&
            matrix[i][matrix[i][j].position.x - 1].status ===
              matrix[i][j].status
          ) {
            matrix[i][j].position.x--;
            merged.push([matrix[i][j], matrix[i][matrix[i][j].position.x]]);
            matrix[i][matrix[i][j].position.x] = {
              status: NaN,
              position: {
                x: matrix[i][j].position.x as position,
                y: j as position,
              },
              visible: false,
              removed: false,
              merged: true,
              trapped: false,
              id: NaN,
            };
          } else matrix[i][matrix[i][j].position.x] = matrix[i][j];
          if (matrix[i][j].position.x !== j) {
            stuck = false;
            matrix[i][j] = null;
          }
        }
      }
      break;
    case 3:
      for (let j = 2; j > -1; j--) {
        for (let i = 0; i < 4; i++) {
          if (matrix[i][j] === null) continue;
          while (
            matrix[i][j].position.x < 3 &&
            matrix[i][matrix[i][j].position.x + 1] === null
          )
            matrix[i][j].position.x++;
          if (
            matrix[i][j].position.x < 3 &&
            matrix[i][matrix[i][j].position.x + 1].status ===
              matrix[i][j].status
          ) {
            matrix[i][j].position.x++;
            merged.push([matrix[i][j], matrix[i][matrix[i][j].position.x]]);
            matrix[i][matrix[i][j].position.x] = {
              status: NaN,
              position: {
                x: matrix[i][j].position.x as position,
                y: j as position,
              },
              merged: true,
              removed: false,
              visible: false,
              trapped: false,
              id: NaN,
            };
          } else matrix[i][matrix[i][j].position.x] = matrix[i][j];
          if (matrix[i][j].position.x !== j) {
            stuck = false;
            matrix[i][j] = null;
          }
        }
      }
      break;
  }
  if (stuck) {
    return null;
  }
  let blank: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (matrix[i][j] === null) blank.push([i, j]);
    }
  }
  let block = null;
  if (blank.length > 0) {
    let [y, x] = blank.splice(Math.floor(Math.random() * blank.length), 1)[0];
    block = generateBlock(blocks, difficulty, [x, y]);
  }
  let add = 0;
  let perk = false;
  for (const iterator of merged) {
    iterator.push(
      mergeBlock(blocks, iterator[0], iterator[1], merged.length, score)
    );
    if (trapped) {
      let time = [0.5, 2][Math.floor(Math.random() * 2)];
      iterator[2].trapped = true;
      iterator[2].status *= time;
    }
    if (iterator[2].status > 100) perk = true;
    add += iterator[0].status;
  }
  if (add > 0 && plus) {
    plus.value.push([add, merged.length, Math.random()]);
    setTimeout(() => {
      plus.value.pop();
    }, 500);
  }
  return {
    blocks: blocks.value.filter((value) => !(value.removed && !value.visible)),
    mergedBlocks: merged,
    generatedBlock: block,
    perk,
  };
}
