var budgetController = (function() {
   var Expense = function(id, desc, value) {  //expense function constructor
       this.id = id;
       this.desc = desc;
       this.value = value;
       this.percentage = -1;
   };

   var Income = function(id, desc, value) {  //income function constructor
        this.id = id;
        this.desc = desc;
        this.value = value;
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
        deleteItem: (type, id) => {
            let ids = data.allItems[type].map((current) => {
                return current.id;
            });
            let index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
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
        calculatePercentages: () => {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: () => {
            let allPerc = data.allItems.exp.map((current) => {
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        test: () => {
            return data;
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
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercentageLabel: '.item__percentage',
            dateLabel: '.budget__title--month'
        };
        const monthTable = [
            'January', 'February', 'March', 'April', 'May',
            'June', 'July', 'August', 'September', 'October',
            'November', 'December'
        ];
        var formatNumber = (num, type) => {
            let numSplit, int, dec;
            // + or - in front of the number, comma seperating the thousands, 2 decimal points
            num = Math.abs(num);
            num = num.toFixed(2);  // returns a string with 2 decimal points
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3);
            }
            dec = numSplit[1];

            return (type === 'inc' ? sign = '+' : '-') + ' ' + int + '.' + dec;
        };
        const formatMonth = (month) => {
        
            return monthTable[month];
        };
        var nodeListForEach = (list, callback) => {
            for(let i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        };

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
                html = `<div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.desc}</div><div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            } else if (type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.desc}</div><div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__percentage">21%</div>
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
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: (percentages) => {
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);


            nodeListForEach(fields, (current, index) => {
                if(percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },
        deleteListItem: (selectorID) => {
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        displayMonth: () => {
            let now, year, month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            monthLabel = formatMonth(month);
            document.querySelector(DOMStrings.dateLabel).textContent = monthLabel + ' ' + year;
        },
        changedType: () => {
            let fields = document.querySelectorAll(DOMStrings.inputType + ',' +
            DOMStrings.inputDesc + ',' + DOMStrings.inputValue); //returns a Node List
            nodeListForEach(fields, (current) => {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        }
   };
})();

//Global App Controller
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
        document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtl.changedType);
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

        updatePercentages();
        };        
    };

    const controlDeleteItem = (event) => {
        let itemID, splitID, type, ID;
        //Moving up to the node for the whole item (inc or expense)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //Break the id into 2 parts  i.e. id-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtl.deleteItem(type, ID);
            //2. Delete item from the UI
            UICtl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            updatePercentages();
        }
    };

    const updateBudget = () => {
        //1. Calculate the budget
        budgetCtl.calculateBudget();
        //2. Return the budget
        let budget = budgetCtl.getBudget();
        //3. Display the budget in the UI
        UICtl.displayBudget(budget);
    };

    const updatePercentages = () => {
        //1. Calculate percentages
        budgetCtl.calculatePercentages();
        //2. Read percentages from the budget controller
        let percentages = budgetCtl.getPercentages();
        //3. Update the UI with the new percentages
        UICtl.displayPercentages(percentages);
    };

    return {
        init: function() {
            setupEventListeners();
            UICtl.displayMonth();
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
