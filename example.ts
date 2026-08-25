// interface Loan {
//     id: number;
//     customerName: string;
//     amount: number;
//     status: 'pending' | 'approved' | 'rejected';
// }


// const loans: Loan[] = [
//     { id: 1, customerName: 'John Doe', amount: 5000, status: 'pending' },
//     { id: 2, customerName: 'Jane Smith', amount: 10000, status: 'approved' },
//     { id: 3, customerName: 'Bob Johnson', amount: 7500, status: 'rejected' }
// ];

// tableList: signal<Loan[]>([]);

// const findId3 = loans.find(loan => loan.id === 3);

// const amountslessthan10000 = loans.find(loan => loan.amount < 10000);

// const findnamebudi = loans.find(loan => loan.customerName === 'Budi');

// const element  = loans.filter(loan => loan.status === 'pending');

// const element2 = loans.filter(loan => loan.id === 2).map(loan => {
//     return {
//         status: loan.status,
//         amount: loan.amount
//     };
// });    