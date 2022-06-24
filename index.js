
// Only works if the browser supports web workers
// (almost all modern ones do - https://caniuse.com/webworkers)
if (window.Worker) {

  // This is the callback function that will draw all of the points it
  // recieves from the workers. 4 workers are going to be created, each
  // of which will be using this same function
  const processWorkerMessage = e => {
    if(e.data.points) {
      const points = e.data.points
      total += points.length
      fill('#800')
      stroke(0, 0)
      points.forEach(point => {
        // Convert from 0 -> 1 to screen coordinates
        const sx = point.x * windowWidth
        const sy = point.y * windowWidth
        circle(sx, sy, 2)
      })
      if(Math.random() < 0.01) {
        // so that the console doesn't get clogged up with tons of messages
        // which can slow things down...
        console.log(`Drawn ${total} points so far...`)
      }
    } else {
      console.log(e.data.message)
    }
  }

  const workers = []
  let total = 0

  // Generating 4 workers, each drawing 10 million points
  // 
  // Note - each of these workers will be doing exactly the same thing
  // If you want to e.g. draw different parts of an image with multiple
  // workers, you'll have to split up the data that you're passing to
  // each one somehow - you can pass any sort of basic structured data you
  // want in the postMessage call. You can't pass complex things like classes
  // or functions - everything would need to be serialized first, or otherwise
  // passed along as string/array based information
  // 
  // Change 4 to something lower if your system struggles with this. Most
  // modern systems and even mobile devices have at least 4 cores available though
  // 
  for(let i = 0; i < 4; i++) {

    const worker = new Worker('worker.js');

    // This is only called once. It kick-starts the worker. In worker.js
    // there is a loop that continues running until all 10,000,000 points are
    // processed. Even once the worker finishes, there may still be a queue
    // of messages waiting to be processed by the main thread, so drawing
    // will likely continue after the workers have finished what they're doing
    worker.postMessage({
      fxhash, // pass along the fxhash string
      count: 10_000_000 // the number of points to render
    });

    // This is where the script listens for the points coming
    // back from the worker, in batches of 1000
    worker.onmessage = processWorkerMessage

    workers.push(worker)

  }

  console.log('Message posted to worker');
  

}


function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    // The draw loop doesn't actually do anything in our case
    // as everything is handled in the onmessage callback from
    // the worker once it has points ready to draw
}