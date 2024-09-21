import React, { useState } from 'react';

const Table = () => {
    return (
        <div className="overflow-x-auto text-black">
            <table className="table w-full text-center table-s">
                <thead>
                    <tr className='text-lg font-bold text-black'>
                        <th>Art ID</th>
                        <th>Art Cid</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Artist Name</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>1</th>
                        <th>12asdfr23</th>
                        <td>Tuklas</td>
                        <td>Art about Gojo</td>
                        <td>Joshua</td>
                        <td className='text-[--orange]'>0.01ETH</td>
                    </tr>
                    <tr>
                        <th>2</th>
                        <th>12asdfr23</th>
                        <td>Tuklas</td>
                        <td>Art about Gojo</td>
                        <td>Joshua</td>
                        <td className='text-[--orange]'>0.01ETH</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


export default Table