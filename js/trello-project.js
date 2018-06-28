// Initialize Firebase

  var config = {
    apiKey: "AIzaSyBT3F2_3QZJ-u2cX3pDjjqwSKjK0RHBgMA",
    authDomain: "pciporin-trello.firebaseapp.com",
    databaseURL: "https://pciporin-trello.firebaseio.com",
    projectId: "pciporin-trello",
    storageBucket: "pciporin-trello.appspot.com",
    messagingSenderId: "222029751691"
  };

  firebase.initializeApp(config);

  var db = firebase.database();

  var listsRef = db.ref('lists');
  var usersRef = db.ref('users');
  var storageRef = firebase.storage().ref();

  // connect Firebase to Vue
  Vue.use(VueFire);

//FUNCTIONS TO CONVERT BETWEEN ID AND INDEX

//list ids are positive numbers beginning at 1
  //index = id - 1
  //id = index + 1
//card ids are negative numbers, first digit is list id
  //index = (-id % 10) - 1
  //id = -[(10 * list.id) + (index + 1)]

function getCardIndex(id) {
  return (-1 * id % 10) - 1;
}

function getListIndex(id) {
  return (id - 1);
}

/*
//Convert date to formatted string
function stringifyDate(d) {
  return d.toString();
}
*/

//Declare variables to store card transfer information
var cardToTransfer;
var fromList;


//Drag method implemented globally
function drag(ev) {
  cardToTransfer = ev.target.id;
  fromList = ev.target.parentElement.parentElement.id;
}



//DECLARE COMPONENTS


//Trello list component

Vue.component('trello-list', {
  props: ['list'],
  template: "<li>{{ list.title }}</li>"
})

/*
Vue.component('comment', {
  props: {
    comment_text: {
      default: "Enter your comment here"
    },
    editting: {
      default: false
    },
    comment-timestamp: null
  },

  template:  `
  <input v-if="editting" v-model="comment_text" @keyup.enter="editting = false">
  <label v-else>{{ comment_text }}</label>
  <button class="btn btn-primary btn-sm" @click="editting = true">Edit Comment</button>
  <button class="btn btn-primary btn-sm">Remove Comment</button>
  `
})
*/

//Trello card template

Vue.component('trello-card', {
  data: function() {
    return "";
  },

  firebase: {
    "users": usersRef
  },

  props: {
    card: null,
    list: null,
    toadd: {
      default: "element (select option above)"
    },
    newElement: {
      default: null
    },
    catColor: {
      default: "#ffffff"
    },
    checkedToDos: {
      default: []
    },
    edittingComment: {
      default: false
    }
  },

  template: `

  <!-- Expanded Card -->
  <div v-if="card.expandCard" class="trello-modal">
    <div class="trello-card">
      <select v-model="toadd">
        <option selected="selected" value="description">Add description</option>
        <option value="deadline">Add deadline</option>
        <option value="image">Add image</option>
        <option value="to-do">Add to-do</option>
        <option value="category">Add category</option>
        <option value="user">Add user</option>
        <option value="comment">Add comment</option>
      </select>
      <br><br>

      <div id="add_selection">
        <input v-if="toadd=='deadline'" type="datetime-local" value="2018-03-15T08:30" v-model="newElement">
        <input v-if="toadd=='description'" type="text" v-model="newElement">
        <input v-if="toadd=='to-do'" type="text" v-model="newElement">
        <form v-if="toadd=='image'" @submit.prevent="addImage(card)">
          <input type="file" id="files" name="files[]">
          <input type="submit" value="Add Image">
        </form>
        <input v-if="toadd=='category'" type="text" v-model="newElement">
        <input v-if="toadd=='category'" type="color" value="#ffffff" id="category-color" v-on:change="catColor = $event.target.value">
        <label v-if="toadd=='category'" type="text" for="category-color">Select color for this category</label>
        <select v-if="toadd=='user'" v-model="newElement">
          <option v-for="user in this.users">{{ user.name }}</option>
        </select>

        <input v-if="toadd=='comment'" type="text" v-model="newElement">

      </div>
      <br>

      <button v-if="toadd!='image'" id="add_element" class="btn btn-primary" v-on:click="addElement(card, toadd, newElement)">Add {{ toadd }}</button>

      <li><b>Name:</b> {{ card.name }}</li>
      <li><b>Card Created:</b> {{ card.timestamp }}</li>
      <li v-if="card.description!=null"><b>Description:</b> {{ card.description }}</li>
      <li v-if="card.deadline!=null"><b>Deadline:</b> {{ card.deadline }}</li>
      <li v-if="card.images!=null && card.images.length!=0"><b>Images:</b></li>
      <div v-if="card.images!=null && card.images.length!=0">
        <div v-for="image in card.images" class="images">
          <img class="card-image" :src="image">
        </div>
      </div>

      <li v-if="card.users!=null"><b>Users:</b></li>
      <ul v-if="card.users!=null" id="user_list">
        <li v-for="user in card.users">{{ user }}</li>
      </ul>

      <li v-if="card.todos!=null && card.todos.length!=0"><b>To Dos:</b></li>
      <ul v-if="card.todos!=null && card.todos.length!=0" id="todo_list">
        <li v-for="task in card.todos"><label><input type="checkbox"><span>{{ task }}</span></label></li>
      </ul>
      <li v-if="card.categories!=null && card.categories.length!=0"><b>Categories:</b></li>
      <ul v-if="card.categories!=null && card.categories.length!=0" id="category_list">
        <li v-for="category in card.categories">
          <div class="color-box" v-bind:style="{ 'background-color': category.color }"></div>
          <span>{{ category.name }}</span>
          <button class="btn btn-primary btn-sm" v-on:click="removeCategory(card, category)">Remove Category</button>
        </li>
      </ul>

      <div v-if="card.comments!=null">
        <span><b>Comments:</b></span>
          <div v-for="comment in card.comments">
            <input v-if="comment.editting" v-model="newElement" type="text" @keyup.enter="updateComment(card, comment, newElement)">
            <li v-else>{{ comment.text }}</li>
            <button class="btn btn-primary btn-sm" @click="comment.editting = true">Edit Comment</button>
            <button class="btn btn-primary btn-sm" @click="removeComment(card, comment)">Remove Comment</button>
          </div>
      </div>

      <button id="collapsebtn" class="btn btn-primary" v-on:click="collapseCard(card)">Collapse Card</button>
    </div>
  </div>

  <!-- Collapsed Card -->
  <div v-else-if="card.expandCard==false && card.isHidden==false" class="trello-card" draggable="true" @drag="drag($event)">
      <input v-if="card.isEditting" v-model="card.name" @keyup.enter="card.isEditting = false" />
      <label v-else @dblclick="card.isEditting = true">{{ card.name }}</label>
      <button class="btn btn-primary" v-on:click="modalView(card)">Expand Card</button>
      <button class="btn btn-primary" v-on:click="removeCard(card)">Remove Card</button>
  </div>`,

  methods: {

    pushCardRef(card) {
      var myCardRef;
      listsRef.orderByChild('id').equalTo(this.list.id).once('value').then(function(snapshot) {
        var updates = {};
        snapshot.forEach(function (myList) {
          var myCards = myList.child('cards');
          myCards.forEach(function (myCard) {
            if (myCard.child('id').val()==card.id) {
              /*
              myCard.forEach(function(myElement) {
                console.log(myElement.key, myElement.val());
                updates[myElement.key] = myElement.val();
              });
              */
              for (key in card) {
                console.log(card[key]);
                updates[key] = card[key];
              }
              myCard.ref.update(updates);
              //return myCard.ref;
            }
          });
        });
      });
    },

    updateComment(card,comment,el) {
      for (item in card.comments) {
        if (card.comments[item]==comment) {
          card.comments[item]["text"] = el;
          card.comments[item]["editting"] = false;
        }
      }
      //this.edittingComment = false;
      this.pushCardRef(card);
    },

    removeComment(card, comment) {
      for (var i=0; i<card.comments.length; i++) {
        if (card.comments[i]==comment) {
          card.comments.splice(i, 1);
        }
      }
      this.pushCardRef(card);
    },

    addImage(card) {
      var input = document.getElementById('files');
      console.log(input.files);
      var localList = this.list;
      //console.log(cardRef);

      if (input.files.length > 0) {
          var file = input.files[0];
            // get reference to a storage location and
              storageRef.child('cardImages/' + file.name).put(file).then(function(snapshot) {
                if(!card.images) {
                  card.images = [];
                }
                console.log(snapshot.downloadURL);
                card.images.push(snapshot.downloadURL);

                //push updates

                listsRef.orderByChild('id').equalTo(localList.id).once('value').then(function(snapshot) {
                  var updates = {};
                  snapshot.forEach(function (myList) {
                    var myCards = myList.child('cards');
                    myCards.forEach(function (myCard) {
                      if (myCard.child('id').val()==card.id) {
                        /*
                        myCard.forEach(function(myElement) {
                          console.log(myElement.key, myElement.val());
                          updates[myElement.key] = myElement.val();
                        });
                        */
                        for (key in card) {
                          console.log(card[key]);
                          updates[key] = card[key];
                        }
                        myCard.ref.update(updates);
                        console.log(myCard.val());
                      }
                    });
                  });
                });

                //console.log(card.images);
                //cardRef.update({'images': card.images});
                //this.pushCardRef(card);
                //this.addElement(card, 'image', snapshot.downloadURL);
              });
                // reset input values so user knows to input new data
        input.value = '';
        //this.pushCardRef(card);
      }
    },

    modalView(card) {
      console.log(card.expandCard.length);
      card.expandCard = true;
      listsRef.orderByChild('id').equalTo(this.list.id).once('value').then(function(snapshot) {
        var updates = {};
        snapshot.forEach(function (myList) {
          var myCards = myList.child('cards');
          myCards.forEach(function (myCard) {
            if (myCard.child('id').val()==card.id) {
              console.log(myCard.child('expandCard').val());
              updates['expandCard'] = true;
              console.log(updates);
              myCard.ref.update(updates);
            }
          });
        });
      });
    },

    collapseCard(card) {
      card.expandCard = false;
      this.pushCardRef(card);
      /*
      listsRef.orderByChild('id').equalTo(this.list.id).once('value').then(function(snapshot) {
        var updates = {};
        snapshot.forEach(function (myList) {
          var myCards = myList.child('cards');
          myCards.forEach(function (myCard) {
            if (myCard.child('id').val()==card.id) {
              console.log(myCard.val());
              updates['expandCard'] = false;
              console.log(updates);
              myCard.ref.update(updates);
            }
          });
        });
      });
      */
    },

    removeCard(card) {
      var toDeleteRef = listsRef.orderByChild('id').equalTo(this.list.id);

      console.log(card.id);
      toDeleteRef.once('value').then(function(snapshot) {
        var updates = {};
        snapshot.forEach(function (myList) {
          var myCards = myList.child('cards');
          myCards.forEach(function (myCard) {
            if (myCard.child('id').val()==card.id) {
              console.log(myCard.val());
              myCard.forEach(function(cardChild) {
                console.log(cardChild.key);
                updates[cardChild.key] = null;
              });
              console.log(updates);
              myCard.ref.update(updates);
            }
          });
        });
      });


      //this.resetCardIds(card);
    },

    resetDeadline(card, deadline) {
      card.deadline = new Date(deadline);
    },

    addElement(card, type, el) {
      if (type=="element (select option above)" || el==null) {
        return;
      }

      else if (type=="to-do") {
        if (!card.todos) {
          card.todos = [];
        }

        card.todos.push(el);
      }

      else if (type=="user") {

        if(!card.users) {
          card.users = [];
        }

        card.users.push(el);

      }

      else if (type=="comment") {
        if (!card.comments) {
          card.comments = [];
        }

        card.comments.push({"text": el, "editting": false});
      }

      else if (type=="description") {
        card.description = el;
      }

      else if (type=="deadline") {
        card.deadline = this.stringifyDeadline(el);
      }

      else if (type=="category" && !this.$parent.categoryMap.has(el)) {
        console.log(this.catColor);

        if (!card.categories) {
          card.categories = [];
        }

        card.categories.push(
          {
            "name": el,
            "color": this.catColor
          }
        );
        this.$parent.updateMap(el, this.catColor);
      }

      this.newElement = null;
      this.pushCardRef(card);
    },

    stringifyDeadline(unformatted) {
      var stringified = unformatted.substring(5,7);
      stringified+= "/" + unformatted.substring(8,10);
      stringified+= "/" + unformatted.substring(0,4);

      stringified+= " at " + unformatted.substring(11,13) + ":" + unformatted.substring(14);
      return stringified;
    },

    removeCategory(card, category) {
      console.log(category);
      for (var i=0; i<card.categories.length; i++) {
        if (card.categories[i].name==category.name) {
          card.categories.splice(i, 1);
          break;
        }
      }
      this.$parent.updateMap(category.name, category.color);
    },

    //update ids of other cards in the current list
    resetCardIds(card) {
      for (var i=0; i<this.list['cards'].length; i++) {
        //card.id = -[(10 * list.id) + (index + 1)]
        var updated = -[(10 * this.list.id) + (i + 1)];
        Vue.set(this.list['cards'][i], "id", updated);
      }
    }

  }
})


//MAIN VUE APP

var app = new Vue({
  data: {
    "newCardName": '',
    "newCardDescription": '',
    "newCardDeadline": '',
    //"lists": [],
    "isAddingList": false,
    "newListTitle": '',
    "projectStyle": {
      backgroundColor: '#00ccff',
      color: '#000000'
    },
    "categoryMap": new Map(),
    "filtered": []
  },

  firebase: function() {
    return {
      "lists": listsRef.orderByChild('id'),
      "users": usersRef
    }
  },

  methods: {
    addCard(list) {
      if (this.newCardName) {
        //id = -[(10 * list.id) + (index + 1)]
        //var targetListRef = listsRef.child(list.id);

        if (list['cards']) {
          var newId = -[(10 * list.id) + (Object.keys(list['cards']).length + 1)];
        }
        else {
          var newId = -[(10 * list.id) + 1];
        }

        //console.log(Object.keys(list['cards']).length);
        //console.log(newId);

        var newCardTitle = this.newCardName;
        var newCardTimestamp = this.stringifyDate(new Date());
        listsRef.orderByChild('id').equalTo(list.id).once('value').then(function(snapshot) {
          snapshot.forEach(child => child.child('cards').ref.push({
            "name": newCardTitle,
            "id": newId,
            "description": null,
            "deadline": null,
            "timestamp": newCardTimestamp,
            "todos": [],
            "categories": [],
            "expandCard": false,
            "isEditting": false,
            "isHidden": false
          }));
        });


        /*
        targetListRef.child('cards').push({
          "name": this.newCardName,
          "id": newId,
          "description": null,
          "deadline": null,
          "timestamp": this.stringifyDate(new Date()),
          "todos": [],
          "categories": [],
          "expandCard": false,
          "isEditting": false,
          "isHidden": false
        });
        */

        this.resetAddCard(list);
      }
    },

    testfn() {
      console.log(this.lists.ref);
      for (list in this.lists) {
        console.log(list.key);
      }
      //listsRef.child('0').push({"name": "guy"});
      /*
      console.log("db is ",db);
      console.log("lists is ", this.lists);
      console.log('usersRef is ', usersRef);
      console.log('users is ', this.users);
      console.log("listsRef is ", listsRef);
      */
      var toDeleteRef = listsRef.orderByChild('id').equalTo(2).once('value').then(function(snapshot) {
        console.log(snapshot.val());
        console.log(snapshot.key);
        snapshot.forEach(child => console.log(child.val()));  //this retrieves the id of last child in lists (for newId)
          //listsRef.update({})
      });

      /*
      listsRef.orderByChild('id').limitToLast(1).once('value').then(function(snapshot) {
        console.log(snapshot.key);
        console.log(snapshot.val());
        //console.log(snapshot.child.child('id').val());
        //snapshot.forEach(child => console.log(child.child('id').val()));  //this retrieves the id of last child in lists (for newId)
        snapshot.forEach(child => console.log(child.key));  //this retrieves the id of last child in lists (for newId)
        //console.log(snapshot.val().id);
      });
      */


      /*
      console.log(listsRef.child(0).once('value'));
      var guyRef = listsRef.orderByChild('id').equalTo(4);
      //console.log(listsRef.child('id'));
      //console.log(guyRef.val());
      guyRef.once('value').then(function(snapshot) {
        console.log(snapshot.val());
        console.log(snapshot.key);
        console.log(snapshot.child.key);
        var updates = {};
        snapshot.forEach(child => updates[child.key] = null);
        console.log(updates);
        //updates[snapshot.key] = null;
        listsRef.update(updates);
      });
      */
      //console.log(guy);
      //guy.remove();
    },

    resetAddCard(list){
      this.newCardName = '';
      this.newCardDescription = '';
      this.newCardDeadline = '';
      list.isAddingCard = false;
    },

    addList() {
      if (this.newListTitle) {
        //id = index + 1
        //var newId = this.lists.length + 1;  ///Change?

        //retrieve current last id in list
        var newId;
        listsRef.orderByChild('id').limitToLast(1).once('value', function(snapshot) {
          snapshot.forEach(child => newId = child.child('id').val());  //this retrieves the id of last child in lists (for newId)
        });

        //set new id to 1 + last current id
        newId++;
        console.log(newId);

        //assume lists is empthy, set newId to 1
        if (this.lists.length<1) {
          listsRef.push({
            "title": this.newListTitle,
            "id": 1,
            "isAddingCard": false,
            "isEditting": false,
            "isCollapsed": false,
            "cards": [],
            "movePosition": -1
          });
        }
        else {
          listsRef.push({
            "title": this.newListTitle,
            "id": newId,
            "isAddingCard": false,
            "isEditting": false,
            "isCollapsed": false,
            "cards": [],
            "movePosition": -1
          });
        }

        this.resetAddList();

      }
    },

    resetAddList() {
      this.newListTitle = '';
      this.isAddingList = false;
    },

    //remove the list at specified index
    removeList(list) {
      var toDeleteRef = listsRef.orderByChild('id').equalTo(list.id);
      //console.log(listsRef.child('id'));
      //console.log(guyRef.val());
      toDeleteRef.once('value').then(function(snapshot) {

        //update desired list's values to null
        var updates = {};
        snapshot.forEach(child => updates[child.key] = null);
        console.log(updates);
        listsRef.update(updates);

      });


      //this.resetListIds();
    },

    removeCard(list, card) {
        var toDeleteRef = listsRef.orderByChild('id').equalTo(list.id);
        toDeleteRef.once('value').then(function(snapshot) {
          snapshot.forEach(child => console.log(child.child('cards').child(cards['.key']).val()));
        });
    },

    moveList(list, pos) {

      var updates = {};
      var listToMove = listsRef.orderByChild('id').equalTo(list.id);

      listToMove.once('value').then(function(snapshot) {
        snapshot.forEach(child => child.ref.update({'id':pos}));
        //snapshot.ref.update({'id': pos})
      });

      listsRef.orderByChild('id').equalTo(pos).once('value').then(function(snapshot) {
        snapshot.forEach(child => child.ref.update({'id':list.id}));
        //snapshot.ref.update({'id': list.id})
      });

      list.movePosition = -1;
      //this.resetListIds();
    },

    updateBackground(event) {
      //console.log(event.target.value);
      var bg = event.target.value;

      //set background color
      this.projectStyle.backgroundColor = bg;
    },

    updateText(event) {
      this.projectStyle.color = event.target.value + " !important";
    },

    stringifyDate(date) {
      var stringified = "" + (date.getMonth() + 1) +  "/" + date.getDate() + "/" + date.getFullYear() + " at " + (date.getHours() + 1) + ":";
      if (date.getMinutes().toString().length==1) {
        stringified+="0";
      }
      stringified += date.getMinutes();
      return stringified;
    },

    populateMap() {
      console.log(this.lists);
      for (list in this.lists) {
        console.log("hi");
      }
      /*
      for (var i=0; i<this.lists.length; i++) {
        var list = this.lists[i];
        for (var j=0; j<list.cards.length; j++) {
          var card = list.cards[j];
          if (!card.categories) {
            card.categories = {};
          }
          for (k=0; k<card.categories.length; k++) {
            var category = card.categories[k];
            console.log(category);
            if (!this.categoryMap.has(category.name)) {
              this.categoryMap.set(category.name, category.color);
            }
          }

        }
      }
      */
      console.log(this.categoryMap);
    },

    updateMap(catName, catColor) {
      //if category already present in map, check to see if it should be removed
      if (this.categoryMap.has(catName)) {
        //var found = false;
        for (var i=0; i<this.lists.length; i++) {
          var list = this.lists[i];
          for (var j=0; j<list.cards.length; j++) {
            var card = list.cards[j];
            for (k=0; k<card.categories.length; k++) {
              var category = card.categories[k];
              if (category.name==catName) {
                //exit method
                return;
              }
            }
          }
        }
        //if we made it this far, then the category was not found in any card
        //and should be deleted
        this.categoryMap.delete(catName);
      }

      //otherwise, it is not present in the map, so it should be added
      else {
        this.categoryMap.set(catName, catColor);
      }
      console.log(this.categoryMap);

      //force update for filter bar
      this.$forceUpdate();
    },

    filterCards() {
      console.log(this.filtered);
      //console.log("clicked");
      for (var listKey in this.lists) {
        var list = this.lists[listKey];
        for (var cardKey in list.cards) {
          var card = list.cards[cardKey];
          for (catKey in card.categories) {
            var category = card.categories[catKey];
            console.log(category);
            //console.log(this.filtered.indexOf(category.name));
            if (this.filtered.indexOf(category.name)>=0) {
              card.isHidden = true;
              break; //break inner loop so card will be hidden
            }
            else {
              card.isHidden = false;
            }
          }
        }
      }
      this.$forceUpdate();
    },

    resetCardIds(list) {
      for (var i=0; i<list['cards'].length; i++) {
        //list.id = index + 1
        var updated = -[(10 * list.id) + (i + 1)];
        Vue.set(list['cards'][i], "id", updated);
      }
    },

    resetListIds() {
      for (var i=0; i<this.lists.length; i++) {
        //list.id = index + 1
        var updated = i + 1;
        //listsRef.child(i).once('value')
        Vue.set(this.lists[i], "id", updated);
      }
    },

    //Drag and Drop Functions
    //drag and drop functionality: https://www.w3schools.com/html/tryit.asp?filename=tryhtml5_draganddrop2
    onDrop(event) {

      if (event.target.className=="drop-box") {
        var destList = event.target.id;
      }
      else if (event.target.parentElement.className=="drop-box") {
        var destList = event.target.parentElement.id;
      }
      else {
        return null;
      }

      //find source list
      console.log(cardToTransfer);
      console.log(destList);
      var cardInfo = {};

      listsRef.orderByChild('id').once('value').then(function(snapshot) {
        snapshot.forEach(function(myList) {
          //console.log(myList.val());
          var myCards = myList.child('cards');
          myCards.forEach(function(myCard) {
            //if list contains desired card, remove it
            var deleteUpdates = {};
            if (myCard.child('id').val()==cardToTransfer) {
              console.log(myList.val());
              myCard.forEach(function(cardElement) {
                //store card info for transfer
                var newKey = cardElement.key;
                cardInfo[newKey] = cardElement.val();
                deleteUpdates[newKey] = null;
                //remove from current list
                //myCard.ref.update({newKey: null})
              });
              myCard.ref.update(deleteUpdates);
            }
            //console.log(myCard.val());
          });
        });
      });

      listsRef.orderByChild('id').once('value').then(function(snapshot) {
        snapshot.forEach(function(myList) {
          //console.log(myList.val());
          if (myList.child('id').val()==destList) {
            myList.child('cards').ref.push(cardInfo);
          }
        });
      });

      /*
      //console.log(this.getListRef(4));
      //this.getListRef.update({'title': "hi"});
      //Only allow dragging onto List Title
      if (event.target.className=="drop-box" || event.target.parentElement.className=="drop-box") {
        console.log("here");
        event.preventDefault();
        //console.log(event.target.parentElement);

        console.log(cardToTransfer);

        //update Source & Destination lists
        var destList;
        if (event.target.parentElement.className=="drop-box") {
          destList = this.lists[getListIndex(event.target.parentElement.parentElement.parentElement.id)];
        }
        else {
          destList = this.lists[getListIndex(event.target.parentElement.parentElement.id)];
        }
        fromList = this.lists[getListIndex(fromList)];
        cardToTransfer = fromList['cards'][getCardIndex(cardToTransfer)];


        //Add card to destination list
        destList['cards'].push(cardToTransfer);

        //Remove card from source list
        console.log(destList, fromList, cardToTransfer);
        fromList['cards'].splice(getCardIndex(cardToTransfer.id), 1);

        this.resetCardIds(destList);
        this.resetCardIds(fromList);
      }
      */

    },

    getListRef(id) {
      var outputRef;

      listsRef.orderByChild('id').equalTo(4).once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {
          console.log(child.val());
          outputRef = child.ref;
        });
        console.log(listsRef.val());
      });

      return outputRef;
    }

  },

  mounted() {
    //console.log(listsRef[10]);
    var toIterate = this.lists;
    var catMap = this.categoryMap;
    listsRef.once('value', function(snapshot) {
      //this.populateMap();
      //console.log(toIterate);
      for (var listKey in toIterate) {
        var list = toIterate[listKey];
        //console.log(list);
        if (!list.cards) {
          list.cards = {};
        }
        for (var cardKey in list.cards) {
          var card = list.cards[cardKey];
          //console.log(card);
          if (!card.categories) {
            card.categories = {};
          }
          for (var catKey in card.categories) {
            var category = card.categories[catKey];
            console.log(category);
            if (!catMap.has(category.name)) {
              catMap.set(category.name, category.color);
            }
          }
        }
      }
      /*
      for (var i=0; i<toIterate.length; i++) {
        var list = toIterate[i];
        if (!list.cards) {
          list.cards = {};
        }
        console.log(list.cards);
        for (var j=0; j<list.cards.length; j++) {
          var card = list.cards[j];
          console.log(card);
          if (!card.categories) {
            card.categories = {};
          }
          for (k=0; k<card.categories.length; k++) {
            var category = card.categories[k];
            console.log(category);
            if (!this.categoryMap.has(category.name)) {
              this.categoryMap.set(category.name, category.color);
            }
          }

        }
      }
      */
    });

    console.log("here")
    /*
    $.getJSON('./data/trello-lists.json?v=1', function(data) {
      console.log(data);
      this.lists = data;
      console.log(this.lists);
    }.bind(this));
    */
  }


});




// attach Vue app to an existing DOM element
app.$mount('#app');
