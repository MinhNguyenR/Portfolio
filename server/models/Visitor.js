const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  // Core identity
  fingerprint: { type: String, unique: true, sparse: true },
  ip:          String,
  
  // Network info
  network: {
    ip:        String,
    country:   String,
    countryCode: String,
    region:    String,
    city:      String,
    zip:       String,
    isp:       String,
    hostname:  String,
    org:       String,
    timezone:  String,
    lat:       Number,
    lon:       Number,
    proxy:     Boolean,
    mobile:    Boolean,
    dns:       String,
    webrtcIp:  String,
  },

  // Browser
  browser: {
    name:      String,
    version:   String,
    userAgent: String,
    platform:  String,
    language:  String,
    languages: [String],
    cookieEnabled: Boolean,
    doNotTrack:   String,
    javaEnabled:  Boolean,
  },

  // OS / Device
  os: { name: String, version: String },
  device: {
    type:   { type: String },
    vendor: String,
    model:  String,
  },

  // Screen
  screen: {
    width:       Number,
    height:      Number,
    availWidth:  Number,
    availHeight: Number,
    colorDepth:  Number,
    pixelDepth:  Number,
    pixelRatio:  Number,
    windowWidth: Number,
    windowHeight: Number,
  },

  // Hardware
  hardware: {
    cores:        Number,  // hardwareConcurrency
    memory:       Number,  // deviceMemory (GB)
    touchPoints:  Number,  // maxTouchPoints
    vendor:       String,
    product:      String,
    appCodeName:  String,
  },

  // Timezone
  timezone: {
    zone:   String,
    offset: Number,
    local:  String,
  },

  // Extended fingerprinting
  fingerprints: {
    canvas:  String,
    webgl:   String,
    webglRenderer: String,
    audio:   String,
    fonts:   [String],
    clientRects: String,
  },

  // Plugins / capabilities
  capabilities: {
    webgl:     Boolean,
    webrtc:    Boolean,
    flash:     Boolean,
    java:      Boolean,
    cookies:   Boolean,
    javascript: Boolean,
    plugins:   [String],
    adblock:   Boolean,
  },

  // Navigation / referrer
  referrer:    String,
  entryPage:   String,

  // Identity (linked from contact form)
  name:  String,
  email: String,

  // Visit tracking
  firstVisit:  { type: Date, default: Date.now },
  lastVisit:   { type: Date, default: Date.now },
  visitCount:  { type: Number, default: 1 },
  pageViews:   { type: Number, default: 0 },
  totalTime:   { type: Number, default: 0 }, // seconds

  clientExtra: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
