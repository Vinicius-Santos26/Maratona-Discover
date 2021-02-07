const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finance:transactions')) || [];
    },
    set(transactions){
        localStorage.setItem('dev.finance:transactions', JSON.stringify(transactions));
    }
}

const Modal = {
    toggle() {
        const modalOverlayClassList = document.querySelector(".modal-overlay").classList;
        let haveActiveClass = modalOverlayClassList.contains("active") ? 
                                modalOverlayClassList.remove("active") : 
                                modalOverlayClassList.add("active");
    },
    // open(){
    //     document
    //         .querySelector('.modal-overlay')
    //         .classList
    //         .add('active');
    // },
    // close(){
    //     document
    //         .querySelector('.modal-overlay')
    //         .classList
    //         .remove('active');
    // }
};

const Transactions = {
    all: Storage.get(),
    add(transaction){
        Transactions.all.push(transaction);
        App.reload();
    },
    remove(index){
        Transactions.all.splice(index, 1);
        App.reload();
    },
    incomes() { 
        let income = 0;
        Transactions.all.forEach(transaction => {
            income += transaction.amount > 0 ? transaction.amount : 0;
        })
        return income;
    },
    expenses() {    
        let expense = 0;
        Transactions.all.forEach(transaction => {
            expense += transaction.amount < 0 ? transaction.amount : 0;
        })
        return expense;
    },
    total() {
        return Transactions.incomes() + Transactions.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const typeOfTransaction = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `                       
            <td class="description">${transaction.description}</td>
            <td class=${typeOfTransaction}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="./assets/minus.svg" alt="Remover transação" onclick="Transactions.remove(${index})">
            </td>
        `;

        return html;
    },
    updateBalance() {
        document.getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.incomes());
        document.getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.expenses());
        document.getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.total());
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const {description, amount, date} = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction){
        Transactions.add(transaction);
    },
    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.toggle();
        } catch (error) {
            alert(error.message)
        }
        
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""; 
        value = String(value).replace(/\D/g, "");

        value = Number(value)/100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        
        return signal + value;
    },
    formatAmount(value) {
        amount = Number(value.replace(/\,\./g, "")) * 100;
        return amount;
    },
    formatDate(value) {
        const splittedDate = value.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
}

const App = {
    init(){
        Transactions.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
        Storage.set(Transactions.all);
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init();


