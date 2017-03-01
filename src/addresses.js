var Metadata = require('./metadata');

var METADATA_TYPE_ADDRESSES = 4;

class Addresses {
  constructor (wallet) {
    var masterhdnode = wallet.hdwallet.getMasterHDNode();
    this._metadata = Metadata.fromMasterHDNode(masterhdnode, METADATA_TYPE_ADDRESSES);

    // For migration and legacy support, we need to keep a reference:
    this.hd_wallet = wallet.hd_wallet;
  }

  toJSON () {
    return {
      version: '1.0.0',
      accounts: this._accounts
    };
  }

  fetch () {
    var Populate = function (object) {
      this.loaded = true;
      if (object !== null) {
        // TODO: run upgrade scripts
        // TODO: abort if major version changed
        this._accounts = object.accounts || []; // TODO: integrity check
      } else {
        this.migrate();
      }
      return this;
    };
    var fetchFailed = function (e) {
      // Metadata service is down or unreachable.
      this.loaded = false;
      return Promise.reject(e);
    };
    return this._metadata.fetch().then(Populate.bind(this)).catch(fetchFailed.bind(this));
  }

  save () {
    if (!this._metadata.existsOnServer) {
      return this._metadata.create(this);
    } else {
      // TODO: do not write if minor or major version has increased
      return this._metadata.update(this);
    }
  }

  wipe () {
    this._metadata.update({}).then(this.fetch.bind(this));
  }

  migrate () {
    this._labels = [];
    // TODO: for each wallet account:
    // TODO:   go through address_labels, add entries here and delete in original wallet
    // TODO:   put placeholder entry with just the index
    //     this.save();
  }

  maxLabeledReceiveIndex (accountIndex) {
    // TODO
  }

  getLabel (accountIndex, addressIndex) {
    if (!this._accounts[accountIndex]) {
      return null;
    }

    const entry = this._accounts[accountIndex][addressIndex];

    if (!entry) {
      return null;
    }

    return entry.label;
  }

  addLabel (accountIndex, addressIndex, label) {
    // TODO: check if it already exists
    if (!this._accounts[accountIndex]) {
      this._accounts[accountIndex] = [];
    }
    this._accounts[accountIndex][addressIndex] = {label: label};

    // Legacy:
    if (false) { // TODO: check if this is the highest index for this account
      // TODO: modify index of account.address_labels entry.
    }
    this.save();
  }

  removeLabel (accountIndex, addressIndex) {
    this._accounts[accountIndex][addressIndex] = undefined;
    // Legacy:
    if (false) { // TODO: check if this was the highest index for this account
      // TODO: modify index of account.address_labels entry.
    }
    this.save();
  }

}

module.exports = Addresses;
