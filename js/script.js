// Initialize Firebase
/*
  var config = {
    apiKey: "AIzaSyBT3F2_3QZJ-u2cX3pDjjqwSKjK0RHBgMA",
    authDomain: "pciporin-trello.firebaseapp.com",
    databaseURL: "https://pciporin-trello.firebaseio.com",
    projectId: "pciporin-trello",
    storageBucket: "",
    messagingSenderId: "222029751691"
  };
  firebase.initializeApp(config);
*/
// create Vue object that will communicate with HTML DOM
var app = new Vue({
  data: {
    // state to keep track of local editted contents
    newLinkText: '',
    newLinkURL: '',
    items: [{
      "title": "Duke Links",
      "isEditting": false,
      "isAddingLink": false,
      "links": [{
          "name": "Duke University",
          "url": "http://www.duke.edu/"
        },
        {
          "name": "Duke Computer Science",
          "url": "http://www.cs.duke.edu/"
        },
        {
          "name": "Duke Basketball",
          "url": "http://www.goduke.com/SportSelect.dbml?SPID=1846"
        },
        {
          "name": "Duke Lemur Center",
          "url": "http://lemur.duke.edu/"
        },
        {
          "name": "Duke Marine Lab",
          "url": "https://nicholas.duke.edu/marinelab"
        },
        {
          "name": "Events at Duke",
          "url": "http://calendar.duke.edu/events/"
        },
        {
          "name": "Duke Chronicle",
          "url": "http://www.dukechronicle.com/"
        },
        {
          "name": "Duke Chapel",
          "url": "https://chapel.duke.edu/"
        }
      ]
    },
    {
"title": "CompSci Links",
"isEditting": false,
"isAddingLink": false,
"links": [
    {
        "name":"Duke Computer Science",
        "url":"http://www.cs.duke.edu/"
    },
    {
        "name":"Association for Computing Machinery (ACM)",
        "url":"http://www.acm.org/"
    },
    {
        "name":"Institute of Electrical and Electronics Engineers (IEEE)",
        "url":"http://www.ieee.org/"
    },
    {
        "name":"Coding Horror",
        "url":"http://blog.codinghorror.com/"
    },
    {
        "name":"Open Source Initiative",
        "url":"https://opensource.org/"
    },
    {
        "name":"W3 Schools",
        "url":"https://www.w3schools.com/"
    },
    {
        "name":"The Programmable Web",
        "url":"https://www.programmableweb.com/"
    },
    {
        "name":"Crap Code",
        "url":"http://codecrap.com/"
    }
]
    }
  ]
  },

  methods: {
    // add newly entered link to the given item if it exists
    addLink(item) {
      // make sure something has been entered into the form
      if (this.newLinkText && this.newLinkURL) {
        // add new link to the links field of the given item
        item['links'].push({
          name: this.newLinkText,
          url: this.newLinkURL
        });
        this.resetAddLink(item);
      }
    },

    // clear input form to prepare for the next entry
    resetAddLink(item) {
      this.newLinkText = '';
      this.newLinkURL = '';
      item.isAddingLink = false;
    }
  }
});

// Define a new component called todo-item
Vue.component('trello-card', {
  template: '<p>This is a card</p>'
})

new Vue({
  el: '#guy'
})

//drag and drop functionality: https://www.w3schools.com/html/tryit.asp?filename=tryhtml5_draganddrop2
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  console.log("target is ", ev.target);
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  console.log(ev.target);
  ev.target.appendChild(document.getElementById(ev.dataTransfer.getData("text")));
}

// attach Vue app to an existing DOM element
app.$mount('#app');
