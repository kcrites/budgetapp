var budgetController = (function() {
   var Expense = function(id, desc, value) {  //expense function constructor
       this.id = id;
       this.desc = desc;
       this.value = value;
   };

   var Income = function(id, desc, value) {  //income function constructor
        this.id = id;
        this.desc = desc;
        this.value = value;
    };
    
    var calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: null
    };

return {
    addItem: function(type, desc, val) {
        var newItem, ID;
        if(data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0;
        }

        if(type === 'exp') {
            newItem = new Expense(ID, desc, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, desc, val);
        }
        data.allItems[type].push(newItem);
        return newItem;
    },
    calculateBudget: () => {

        //Calculate the total income and expenses
        calculateTotal('inc');
        calculateTotal('exp');
        //Calculate the budget
        data.budget = data.totals.inc - data.totals.exp;
        //Calculate the percentage of expenses to income
        if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
        } else {data.percentage = -1;}
    },
    getBudget: () => {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }
    }
};

})();

var UIController = (function() {
        var DOMStrings = {      
            inputType: '.add__type',
            inputDesc: '.add__description',
            inputValue: '.add__value',
            inputButton: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expenseLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage'
        }

   return {
        getInput: function() {          //Expose the input values to other controllers
            return {
                type: document.querySelector(DOMStrings.inputType).value, //inc or exp
                desc: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },
        addListItem: function(obj, type) {
            var html, element;
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="income-${obj.id}">
                <div class="item__description">${obj.desc}</div><div class="right clearfix">
                <div class="item__value">${obj.value}</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            } else if (type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="expense-${obj.id}">
                <div class="item__description">${obj.desc}</div><div class="right clearfix">
                <div class="item__value">${obj.value}</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            }
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach((current, index, array) => {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        getDOMStrings: function() {     //Expose the variables to other controllers
            return DOMStrings;
        },
        displayBudget: (obj) => {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
            if(obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        }
   };
})();


var controller = (function(budgetCtl, UICtl) {
   
    var setupEventListeners = function() {
        var DOM = UICtl.getDOMStrings();
        //Callback function controlAddItem
        document.querySelector(DOM.inputButton).addEventListener('click', controlAddItem);

        document.addEventListener('keyup', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                controlAddItem();
            }
        });
    };


    const controlAddItem = () => {
        var input, newItem;
        
        //1. Get the field input data
        input = UICtl.getInput();
        if(input.desc !== '' && !isNaN(input.value) && input.value > 0){
        //2. Add the item to the budget controller
        newItem = budgetCtl.addItem(input.type, input.desc, input.value);
        //3. Add the item to the UI
        UICtl.addListItem(newItem, input.type);
        //4. Clear the fields
        UICtl.clearFields();
        //5. Calculate and update budget
        updateBudget();
        };

        
    };

    const updateBudget = () => {
        //1. Calculate the budget
        budgetCtl.calculateBudget();
        //2. Return the budget
        let budget = budgetCtl.getBudget();
        //3. Display the budget in the UI
        UICtl.displayBudget(budget);
    };

return {
    init: function() {
        setupEventListeners();
        UICtl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
        });
    }
}

})(budgetController, UIController);

controller.init();
