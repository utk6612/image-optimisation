var testImages = [
//   "http://via.placeholder.com/510",
//   "http://via.placeholder.com/510",
//   "http://via.placeholder.com/510",
//   "http://via.placeholder.com/510",
  "https://cms.cowrksassets.com/cms/image/Privatestudio_320x240.jpg",
  "https://cms.cowrksassets.com/cms/image/Privatestudio_320x240.jpg",
  "https://cms.cowrksassets.com/cms/image/Privatestudio_320x240.jpg",
  "https://cms.cowrksassets.com/cms/image/Privatestudio_320x240.jpg",
]; //the list of test images which will be downloaded for measuring the network speed.

var downloadSize = 357 * 1024; // size of each test image in bytes.

const showMessage = msg => {
  var oProgress = document.getElementById("progress");
  if (oProgress) {
    var actualHTML = typeof msg == "string" ? msg : null;
    oProgress.innerHTML = actualHTML;
  }
};

const rangeFinder = value => {
  for (let i = 0; i < ranges.length; i++) {
    // 'ranges' is defined in config.js
    if (value >= ranges[i].min && value < ranges[i].max)
      return ranges[i].quality;
  }
  return 100;
};

const processDurations = durations => {
  const total = durations.reduce((acc, c) => acc + c, 0);
  let avg = total / durations.length; // finding average duration for test images
  let duration = avg / 1000; // conversion from ms to seconds
  let bitsLoaded = downloadSize * 8; // bytes to bits conversion
  let speedBps = Math.round((bitsLoaded / duration) * 100) / 100; // speed = bits / duration
  let speedKbps = Math.round((speedBps / 1024) * 100) / 100;
  let speedMbps = Math.round((speedKbps / 1024) * 100) / 100; // conversion to Mbps
  console.log(speedBps, speedKbps, speedMbps);
  return rangeFinder(speedMbps); // a function for mapping the network speed to the quality %.
};

const getImagePath = (path, x, y) => {
  if (quality) {
    return `${IMAGE_SERVICE_URL}/${x}x${y}/filters:quality(${quality})/${path.substring(
      path.lastIndexOf("/") + 1
    )}`;
  }
  return `${IMAGE_SERVICE_URL}/${x}x${y}/${path.substring(
    path.lastIndexOf("/") + 1
  )}`;
};

const loadSpeedTestSamples = url => {
  /*  
    function for measuring the time required to load a sample image.
    */
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => {
      endTime = new Date().getTime();
      resolve(endTime - startTime);
    });
    image.addEventListener("error", () => {
      reject(new Error()); // error handling for sample image load fail
    });
    startTime = new Date().getTime();
    const cacheBuster = "?xy=" + startTime;
    image.src = url + cacheBuster;
  });
};

var quality = 100;

const MeasureInternetSpeed = async () => {
  /*
    Entry point.
    This function downloads 4 sample images one after another to find the network speed. 
    The network speed is further used to find the optimum quality of images which can be loaded with this speed.
    */
  let durations = [];
  showMessage("loading...");
  for (var i = 0; i < testImages.length; i++) {
    try {
      var k = await loadSpeedTestSamples(testImages[i]);
      durations.push(k);
    } catch (e) {
      console.log(e);
    }
  }
  showMessage("");
  document.getElementById("progress").hidden = true;
  if (durations.length) quality = processDurations(durations);
  return quality;
};
