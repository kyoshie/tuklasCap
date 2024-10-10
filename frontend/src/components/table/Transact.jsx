import React from 'react';



const Transact  = () => {
    const data = [
        { date: '2023-10-01', price: 'ETH 0.001', title: 'Gojo Art', boughtFrom: 'Bob' , boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Gojo Art', boughtFrom: 'David', boughtBy: 'Kyoshie'},
       
      ];
    return (
          <div className="h-full overflow-x-auto">
          <table className="table w-full text-center">
            <thead>
              <tr className='text-white border-t md:text-2xl '>
                <th className="px-4 py-2 border-b">Date</th>
                <th className="px-4 py-2 border-b">Price</th>
                <th className="px-4 py-2 border-b">Title</th>
                <th className="px-4 py-2 border-b">Bought By</th>
                <th className="px-4 py-2 border-b">Bought From</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 ">{item.date}</td>
                  <td className="px-4 py-2 ">{item.price}</td>
                  <td className="px-4 py-2 ">{item.title}</td>
                  <td className="px-4 py-2 ">{item.boughtBy}</td>
                  <td className="px-4 py-2 ">{item.boughtFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>







    );


}

export default Transact