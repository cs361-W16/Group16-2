

var pageOverlay = function (toLoad) {
  $("body").append('<div class="pageOverlay"> </div>');
  if (toLoad) {
    $(".pageOverlay").load(toLoad);


  }
};

var deckChoice = $('#chosenDeck').load("regionSelect");



$( document ).ready(function() {    



  // console.log("user chose" + deckChoice)

  var acesUp = (function(data) {


    game = null; // Object holds deck and current dealt colum
    curRow = 0; // iterator for deal function

    

    
    $("#dealButton").click(function(){
      if(game.deck.length == 0){
        $("#errorMsg").text("There are no more cards in the deck");
        $("#errors").delay(1000).fadeOut(400)
        $("#errors").css("display", "");
      }
      $.ajax({
        type: "POST",
        url: "/dealGame",
        data: JSON.stringify(game),
        success: function(data, status){console.log("Data: " + data + "\nStatus: " + status);
        game = data;
        display(data);

      },

      contentType:"application/json; charset=utf-8",
      dataType:"json",
    });

    });
    

    $(".draggable").draggable({enabled:true, revert: true});



    var chooseDeck = (function() {


    $("#deckEngish input").click(function() {
    fetchDeck("english");
    $('.pageOverlay').fadeOut();
    $('#deckChoice').fadeOut();
  });

    $("#deckSpanish input").click(function() {
      $('#dealButton h3').text("Acuerdo");
      $('#newGame span').text("Nuevo juego");
      $('#deck button').css("background-image", "url(assets/images/spanishDeck.png)");
    fetchDeck("spanish");
    $('.pageOverlay').fadeOut();
    $('#deckChoice').fadeOut();
  });

})();


var fetchDeck = function(deckChoice) {


    $.getJSON("http://localhost:8080/game/" + deckChoice, function( data ) {
      console.log("printing data" + data);
      display(data);
      game = data;

    });


  }


    var display = function(game) {
      i = 1;


      game.cols.forEach(function(card) {

       $("#col" + i).children().each(function() {
         if($(this).children().is(':empty')) {
           $(this).children().remove();
         }
       }); 





       $("#col" + i).children().children().attr("data-istop", 0);
       $("#col" + i).append('<div class="droppable"> <div class="card" data-suit="' + card[curRow].suit + '" data-value="' + card[curRow].value + '" data-istop="1" data-hascard="1"><img src="assets/images/cardPics/' + card[curRow].value + '_of_' + card[curRow].suit + '.png" width="200" style="top:' + (-65*curRow) + 'px"/></div></div>').children(':last').hide().fadeIn(350*i);
       i++;


     }) 



      curRow++;

      $(".card").click(function() {
        checkDiscard($(this));
      });


      updateDroppable();
      updateDraggable();
    };



    var checkDiscard = function(cardObj) {
      topCards = null;
      canDiscard = false;


    if(!parseInt(cardObj.attr("data-istop"))) { // if not on top, automagically not discardable
      return false;
    } else {
      topCards = getTopCards();
    }
    
    
    topCards.forEach(function(cmprCard) {


      if(cmprCard.attr("data-suit") === cardObj.attr("data-suit") &&
       (parseInt(cmprCard.attr("data-value")) > parseInt(cardObj.attr("data-value")))) {
        canDiscard = true;
    }
  });
    
    if(canDiscard) {
      removeCard(cardObj);
    }
    else if(canDiscard == false){
      $("#errorMsg").text("That is not a legal move!!!");
      $("#errors").delay(1000).fadeOut(400)
      $("#errors").css("display", "");
    }

  }



  var removeCard = function(cardObj) {

    cardObj.parent().siblings().each(function() {
      console.log("Looking at the children of:");
      console.log($(this).children());
      if(!$(this).children().is(':empty')) 
      {
       console.log("This is returning true.");
       $(this).children().attr("data-istop", 1);
     } 
   })
    

    cardObj.attr("data-istop", 0);
    cardObj.attr("data-suit", " ");
    cardObj.attr("data-value", " ");
    cardObj.attr("data-hascard", 0);
    cardObj.children().fadeOut(500, function() {
      cardObj.empty();
    });
    updateDroppable();
    updateDraggable();


  };

  var updateDraggable = function() {
    try {
      $currentDrag = $('#board div[data-istop="0"]');
      $nextDrag = $('#board div[data-istop="1"]');
      if ($currentDrag.data( "ui-draggable" )) {
        $currentDrag.draggable("destroy"); 
      }
      $currentDrag.removeClass("draggable");
      $currentDrag.removeClass("ui-draggable");
      $currentDrag.removeClass("ui-draggable-handle");

      $nextDrag.addClass("draggable");
      $nextDrag.draggable({
        revert: "invalid"
      });
      // $nextDrag.draggable({
      //   scope: droppable
      // });
}
catch(e) {
  null;
}

}

var updateDroppable = function() {

  $('#board div[data-hascard="1"]').removeClass("droppable");
  $('#board div[data-hascard="0"]').addClass("droppable");


  $( ".droppable" ).droppable({
    accept: ".draggable",
    over: function(event, ui) {

      ui.draggable.parent().siblings().each(function() {
        if(parseInt($(this).children().attr("data-hascard")) == 1) {
          $(this).droppable("disable")
        }
      });

      if(parseInt($(this).children().attr("data-hascard"))) {
        $(this).droppable("disable")
      }
    },
    out: function(event, ui) {
      $(this).droppable("enable")
    },
    drop: function(event, ui) {

           // switch the properties of the elements
           $(this).children().html(ui.draggable.html());
           $(this).children().droppable("destroy");
           $(this).children().removeClass("droppable");
           $(this).children().addClass("draggable");
           $(this).children().attr("data-hascard", 1);
           $(this).children().attr("data-istop", 1);
           $(this).children().attr("data-suit", ui.draggable.attr("data-suit"));
           $(this).children().attr("data-value", ui.draggable.attr("data-value"));
           $(this).children().html(ui.draggable.html());
           $(this).children().draggable({
             revert: true
           });


           
           ui.draggable.empty();
            ui.draggable.attr("style", " ") // reset the dragged card div back to original spot, for dropping in later
            
            $( document ).ready(function() {

              console.log("YOU ARE LOOKING AT THIS DEBUG STATEMENT");
              console.log(ui.draggable.parent().prev().children());
              ui.draggable.parent().prev().children().attr("data-istop", 1);
              ui.draggable.prev().addClass("draggable");
              ui.draggable.prev().draggable();
              ui.draggable.removeClass("draggable");
              ui.draggable.draggable("destroy");
              ui.draggable.addClass("droppable");

              ui.draggable.attr("data-hascard", 0);
              ui.draggable.attr("data-istop", 0);
              ui.draggable.attr("data-suit", " ");
              ui.draggable.attr("data-value", " ");

              $('#board div[data-hascard="1"]').removeClass("droppable");
              $('#board div[data-hascard="0"]').addClass("droppable");

              ui.draggable.droppable({
               accept: ".draggable"
             });

              ui.draggable.droppable("enable");

            });

          }
        });






}


var getTopCards = function() {
 topCards = [];

 $('#board div[data-istop="1"]').each(function() {
   topCards.push($(this));
 });

 return topCards;
}













return {display: display, checkDiscard: checkDiscard, getTopCards: getTopCards, removeCard: removeCard, updateDraggable: updateDraggable, updateDroppable: updateDroppable, fetchDeck: fetchDeck,  chooseDeck: chooseDeck}

}());

}); // End of document.ready
