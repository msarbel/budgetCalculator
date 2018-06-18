

// BUDGET CONTROLLER
var budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
          this.percentage = -1;
        }


    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;    
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var caluclateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    
    }

    return {
      addItem: function(type, des, val) {
          let newItem, ID;

          // create new ID
          if(data.allItems[type].length > 0){
              ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
          } else {
            ID = 0;
          }
          

          // create new item based on type value
          if(type === 'exp') {
            newItem = new Expense(ID, des, val);
          } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
          }
          
          // push into array structure
          data.allItems[type].push(newItem);

          // return the new element
          return newItem;

      }, 

      deleteItem: function(type, id) {
          let ids, index
          // loop over elements in array
          ids = data.allItems[type].map(function(current) {
              return current.id;
          });

          index = ids.indexOf(id);

          //remove elements at array index
          if(index !== -1) {
            data.allItems[type].splice(index, 1);
          }

      },

      calculateBudget: function() {

          // calculate total income and total expenses
          caluclateTotal('exp');
          caluclateTotal('inc');

          // calculate budget  (income - expenses)
          data.budget = data.totals.inc - data.totals.exp;


          // calculate percentage of income that we spent

          if(data.totals.inc > 0) {
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
          data.percentage = -1
        }

      },

      calculatePercentages: function() {

          data.allItems.exp.forEach(function(cur) {
              cur.calcPercentage(data.totals.inc);
          });

      },

      getPercentages: function() {

          var allPerc = data.allItems.exp.map(function(cur) {
              return cur.getPercentage();
          });
          return allPerc;

      },

      getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };

      },

      testing: function() {
        console.log(data);

      }
    };


})();




// UI CONTROLLER
var UIController = (function() {

  var DOMstrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage'

  };

  var formatNumber = function(num, type) {
        let numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        */

        // calc absolute of value
        num = Math.abs(num);
        num = num.toFixed(2); // creates string with decimal point

        // split number
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
          // adding comma
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // result 2310 = 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


    };

  return {
    getinput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // value will be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // create HTML string with placeholder text
      if(type === 'inc'){ 

        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
        
        } else if (type === 'exp')  {

        element = DOMstrings.expensesContainer;  
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
        
        }

      // replace the placeholder
      newHtml = html.replace('%id%', obj.id); 
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // intert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID) {

        let el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);


    },

    clearFields: function() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + 
      DOMstrings.inputValue);
    
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();

    },

    displayBudget: function(obj) {
        let type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if(obj.percentage > 0) {
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
        } else {
          document.querySelector(DOMstrings.percentageLabel).textContent = '----';
        }

    },

    displayPercentages: function(percentages) {

        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        var nodeListForEach = function(list, callback) {

          for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
          }

        };

        nodeListForEach(fields, function(current, index) {

            if(percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
        });

    },


    getDOMstrings: function() {
      return DOMstrings;
    }
  };


})();


// GLOBAL CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

   let setupEventListeners = function() {

       let DOM = UICtrl.getDOMstrings();

       document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

       document.addEventListener('keypress', function(event) {
         if(event.keyCode === 13 || event.which === 13) {
           ctrlAddItem();
         }


      });

       document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

   };

   var updateBudget = function() {

        // calculate the budget 
        budgetCtrl.calculateBudget();

        // return budget
        let budget = budgetCtrl.getBudget();

        // display the budget on UI
        UICtrl.displayBudget(budget);

   };

   var updatePercentages = function() {

      // calc percentages
      budgetCtrl.calculatePercentages();

      // read % from budget controller
      var percentages = budgetCtrl.getPercentages();

      // update UI %
      UICtrl.displayPercentages(percentages);


   };

   let ctrlAddItem = function() {
      var input;

        // get input data
        input = UICtrl.getinput();
       
       //check for input correctness on both name and value 
       if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // add item to budget controller
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add new item to UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearFields();

            //calculate/update budget
            updateBudget();

            // calculate/update percentages
            updatePercentages();
       }

  };

  var ctrlDeleteItem = function(event) {
      let itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if(itemID) {

        //inc-1 
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // delete item from data
        budgetCtrl.deleteItem(type, ID);
        // delete item from UI
        UICtrl.deleteListItem(itemID);
        // update UI
        updateBudget();
        // calculate/update percentages
        updatePercentages();

      }

  };

  return {
    init: function() {
      // sets initial numbers to 0 when refreshed or new page
        console.log('app has started');
        UICtrl.displayBudget(
            {budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
          });
        setupEventListeners();
    }
  };

})(budgetController, UIController);


controller.init();



















