App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("VoteTracker.json", function (voteTracker) {
      App.contracts.VoteTracker = TruffleContract(voteTracker);
      App.contracts.VoteTracker.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function () {
    var voteTrackerInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.VoteTracker.deployed()
      .then(function (instance) {
        voteTrackerInstance = instance;
        return voteTrackerInstance.itemCount();
      })
      .then(function (itemCount) {
        var itemResults = $("#itemResults");
        itemResults.empty();

        var itemSelect = $("#itemSelect");
        itemSelect.empty();

        for (var i = 1; i <= itemCount; i++) {
          voteTrackerInstance.items(i).then(function (item) {
            var name = item[0];
            var voteCount = item[1];
            var id = item[2];

            var itemTemplate =
              "<tr><th>" + name + "</th>" + "<td>" + voteCount + "</td></tr>";
            itemResults.append(itemTemplate);

            var itemOption =
              "<option value='" + id + "' >" + name + "</ option>";
            itemSelect.append(itemOption);
          });
        }
      })
      .then(function (hasVoted) {
        if (hasVoted) {
          $("form").hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },

  castVote: function () {
    var itemId = $("#itemSelect").val();
    App.contracts.VoteTracker.deployed()
      .then(function (instance) {
        return instance.vote(itemId, { from: App.account });
      })
      .then(function (result) {
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
