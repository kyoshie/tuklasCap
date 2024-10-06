import React from 'react';



const Transact  = () => {
    const data = [
        { date: '2023-10-01', price: 'ETH 0.001', title: 'Item 1', boughtBy: 'Alice', boughtFrom: 'Bob' },
        { date: '2023-10-02', price: 'ETH 0.021', title: 'Item 2', boughtBy: 'Charlie', boughtFrom: 'David' },
       
      ];
    return (
          <div className="overflow-x-auto">
          <table className="table w-full text-center">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-l">Date</th>
                <th className="px-4 py-2 border-b">Price</th>
                <th className="px-4 py-2 border-b">Title</th>
                <th className="px-4 py-2 border-b">Bought By</th>
                <th className="px-4 py-2 border-b">Bought From</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b">{item.date}</td>
                  <td className="px-4 py-2 border-b">{item.price}</td>
                  <td className="px-4 py-2 border-b">{item.title}</td>
                  <td className="px-4 py-2 border-b">{item.boughtBy}</td>
                  <td className="px-4 py-2 border-b">{item.boughtFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>







    );


}

export default Transact