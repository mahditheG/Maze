//making the canvas and what nut (boiler plate)
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const engine = Engine.create();
const { world } = engine;
engine.world.gravity.y = 0;

let cellsHorizontal = 10;
let cellsVertical = 10;
const width = window.innerWidth - 5;
const height = window.innerHeight - 5;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true,
  }),
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true,
  }),
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true,
  }),
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true,
  }),
];
World.add(world, walls);

// making the maze
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));
// making the vertical and horizontal

const vertical = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));
const horizontal = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThruoghCell = (row, column) => {
  //if i have visited [row][column] , return
  if (grid[row][column]) {
    return;
  }
  //change [row][column] to visited
  grid[row][column] = true;
  //make a list of randomly-ordered neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);
  //for each neighbors do these ...
  for (let neighbor of neighbors) {
    const [nextrow, nextcolumn, direction] = neighbor;
    //check if neighbors exist (is not out of bound)
    if (
      nextrow < 0 ||
      nextrow >= cellsVertical ||
      nextcolumn < 0 ||
      nextcolumn >= cellsHorizontal
    ) {
      continue;
    }
    //if we have visited this neighbor , continue to next
    if (grid[nextrow][nextcolumn]) {
      continue;
    }

    //remove a wall from vertical or horizontal
    if (direction === "left") {
      vertical[row][column - 1] = true;
    } else if (direction === "right") {
      vertical[row][column] = true;
    } else if (direction === "up") {
      horizontal[row - 1][column] = true;
    } else if (direction === "down") {
      horizontal[row][column] = true;
    }
    //visit that next cell
    stepThruoghCell(nextrow, nextcolumn);
  }
};
stepThruoghCell(startRow, startColumn);

horizontal.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    const wall = Bodies.rectangle(
      unitLengthX * columnIndex + unitLengthX / 2,
      unitLengthY * rowIndex + unitLengthY,
      unitLengthX,
      5,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "white",
        },
      }
    );
    World.add(world, wall);
  });
});

vertical.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "white",
        },
      }
    );
    World.add(world, wall);
  });
});
//goal

World.add(
  world,
  Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
      label: "goal",
      isStatic: true,
      render: {
        fillStyle: "green",
      },
    }
  )
);
//player
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "aqua",
  },
});
World.add(world, ball);
const { x, y } = ball.velocity;
document.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    Body.setVelocity(ball, { x, y: y - 4 });
  }
  if (e.key === "d") {
    Body.setVelocity(ball, { x: x + 4, y });
  }
  if (e.key === "s") {
    Body.setVelocity(ball, { x, y: y + 4 });
  }
  if (e.key === "a") {
    Body.setVelocity(ball, { x: x - 4, y });
  }
});
document.addEventListener("keyhold", (e) => {
  if (e.key === "w") {
    Body.setVelocity(ball, { x, y: y - 4 });
  }
  if (e.key === "d") {
    Body.setVelocity(ball, { x: x + 4, y });
  }
  if (e.key === "s") {
    Body.setVelocity(ball, { x, y: y + 4 });
  }
  if (e.key === "a") {
    Body.setVelocity(ball, { x: x - 4, y });
  }
});
// win condion
Events.on(engine, "collisionStart", (e) => {
  const labels = ["goal", "ball"];
  e.pairs.forEach((collision) => {
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");

      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
