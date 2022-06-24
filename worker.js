
// Copy the fxrand() code to provide the worker with the same
// random functionality as the main thread.
// This takes a fxhash param as an argument to generate the fn

const makeFxrand = fxhash => {
  let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
  let b58dec = str=>[...str].reduce((p,c)=>p*alphabet.length+alphabet.indexOf(c)|0, 0)
  let fxhashTrunc = fxhash.slice(2)
  let regex = new RegExp(".{" + ((fxhash.length/4)|0) + "}", 'g')
  let hashes = fxhashTrunc.match(regex).map(h => b58dec(h))
  let sfc32 = (a, b, c, d) => {
    return () => {
      a |= 0; b |= 0; c |= 0; d |= 0
      var t = (a + b | 0) + d | 0
      d = d + 1 | 0
      a = b ^ b >>> 9
      b = c + (c << 3) | 0
      c = c << 21 | c >>> 11
      c = c + t | 0
      return (t >>> 0) / 4294967296
    }
  }
  return sfc32(...hashes)
}

onmessage = e => {
  console.log('Message received from main script');
  const fxhash = e.data.fxhash
  const fxrand = makeFxrand(fxhash)
  console.log('Posting message back to main script');

  let points = []
  // Start a loop, this will generate all of the points we
  // have requested from the main thread
  for(let i = 0; i < e.data.count; i++) {

    // Do some slightly complex calculations to generate our random points here...
    // This could be anything you want, I've added this here to put extra stress on the worker tasks
    const x = Math.abs(Math.sin(fxrand() * Math.PI * 2) * Math.cos(fxrand() * Math.PI * 2))
    const y = Math.abs(Math.cos(fxrand() * Math.PI * 2) * Math.sin(fxrand() * Math.PI * 2))

    points.push({ x, y })

    // Once we get 1000 points in the points array/buffer
    // post them back to the main thread and then empty
    // the point buffer again
    if(points.length == 1000) {
      postMessage({ message: "Here's some points to draw", points })
      points = []
    }


  }

  // This message only gets posted once all points are processed
  postMessage({ message: "All done"});
}