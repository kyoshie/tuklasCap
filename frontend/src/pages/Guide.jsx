import React from 'react';

const Guide = () => {
    return (
        
        //for metamask wallet installation
        <div className='bg-[--backround] min-h-screen py-8 px-4'>
            <div className='mb-8'>
                <h2 className='text-2xl font-bold text-center text-white md:text-3xl md:text-left md:px-5'>
                    What is Metamask Wallet and How to Install?
                </h2>
                <p className='px-3 pt-4 text-white md:text-xl md:ml-5'>
                    Metamask is a digital wallet used to securely store digital assets and connect with blockchain platform applications.
                    To install Metamask, visit
                    <a
                        href='https://metamask.io/'
                        className='text-[--blue] underline hover:text-[--hover-blue]'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {' '}https://metamask.io/
                    </a>
                    . Click the "Download" button, then select "Install Metamask for Chrome" (or your preferred browser) and add it as an extension.
                </p>
            </div>

            <div className='mb-8'>
                <h2 className='text-2xl font-bold text-center text-white md:text-3xl md:text-left md:px-5'>
                    How to Have Ether in Your Wallet?
                </h2>
                <p className='px-3 pt-4 text-white md:text-xl md:ml-5'>
                    To get Ether (ETH) in your wallet, follow these steps:
                </p>
                <ul className='px-5 pt-3 text-white list-disc md:text-xl md:ml-10'>
                    <li>
                        <strong>Purchase from a Cryptocurrency Exchange:</strong> Visit a trusted cryptocurrency exchange like
                        Coinbase, Binance, or Kraken. Create an account, complete the required verification, and purchase Ether.
                        Transfer the Ether to your Metamask wallet address.
                    </li>
                    <li>
                        <strong>Receive from Another Wallet:</strong> Share your Metamask wallet address with someone who can send
                        you Ether. Be cautious and double-check the wallet address to ensure accuracy.
                    </li>
                    <li>
                        <strong>Earn Ether:</strong> Participate in blockchain-based applications, such as decentralized finance (DeFi)
                        platforms, or freelance services that pay in Ether.
                    </li>
                    <li>
                        <strong>Use Faucets (For Test Networks):</strong> If you're learning or testing, you can use Ether faucets to
                        receive free test Ether for networks like Rinkeby or Sepolia. Visit a faucet, provide your wallet address,
                        and receive test Ether.
                    </li>
                </ul>
            </div>

            <div className='mb-8'>
                <h2 className='text-2xl font-bold text-center text-white md:text-3xl md:text-left md:px-5'>
                    Additional Resources
                </h2>
                <p className='px-3 pt-4 text-white md:text-xl md:ml-5'>
                    Learn more about Metamask and Ether through these resources:
                </p>
                <ul className='px-5 pt-3 text-white list-disc md:text-xl md:ml-10'>
                    <li>
                        <a href='https://metamask.io/' className='text-[--blue] underline hover:text-[--hover-blue]' target='_blank' >
                            Official Metamask Website
                        </a>
                    </li>
                    <li>
                        <a href='https://ethereum.org/en/' className='text-[--blue] underline hover:text-[--hover-blue]' target='_blank'>
                            Ethereum Official Website
                        </a>
                    </li>
                    <li>
                        <a
                            href='https://academy.binance.com/' className='text-[--blue] underline hover:text-[--hover-blue]' target='_blank'>
                            Binance Academy (Cryptocurrency Tutorials)
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Guide;