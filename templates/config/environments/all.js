module.exports = function() {
  // Warn of version mismatch between global "witty" binary and local installation of Witty.
  if (this.version !== require('witty').version) {
    console.warn('version mismatch between local (%s) and global (%s) Witty module', require('witty').version, this.version);
  }
};
