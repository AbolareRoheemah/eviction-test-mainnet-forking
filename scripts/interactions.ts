import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    // const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const pair = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5"
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountADesired = ethers.parseUnits("2000", 6);
    const liquidity = ethers.parseUnits("1", 18);
    const amountBDesired = ethers.parseUnits("200", 18);
    const amountAMin = ethers.parseUnits("10", 6);
    const amountBMin = ethers.parseUnits("100", 18);
    const amountEthMin = ethers.parseEther("0.1");

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    // const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const pair_contract = await ethers.getContractAt("IERC20", pair, impersonatedSigner);
    const amountETHDesired = ethers.parseEther("1");
    
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
    // const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);
    const amountOut = ethers.parseUnits("1", 18);
    const amountInMax = ethers.parseUnits("3000", 6);

    await USDC_Contract.approve(ROUTER, amountInMax);
    // await DAI_Contract.approve(ROUTER, amountBDesired);
    await pair_contract.approve(ROUTER, liquidity);

    console.log("usdc balance before swap tx", ethers.formatUnits(usdcBal));
    // console.log("dai balance before swap tx", ethers.formatUnits(daiBal));
    console.log("eth balance before swap tx", ethers.formatUnits(ethBal));

    // await ROUTER.addLiquidity(
    //     USDC_Contract,
    //     DAI_Contract,
    //     amountADesired,
    //     amountBDesired,
    //     amountAMin,
    //     amountBMin,
    //     impersonatedSigner.address,
    //     deadline
    // );

    // await ROUTER.removeLiquidity(
    //     USDC_Contract,
    //     DAI_Contract,
    //     liquidity,
    //     amountAMin,
    //     amountBMin,
    //     impersonatedSigner.address,
    //     deadline
    // );

    await ROUTER.addLiquidityETH(
        USDC_Contract,
        amountADesired,
        amountAMin,
        amountEthMin,
        impersonatedSigner.address,
        deadline,
        { value: amountETHDesired }
    )

    await ROUTER.swapTokensForExactETH(
        amountOut,
        amountInMax,
        [USDC, WETH],
        TOKEN_HOLDER,
        deadline
       );
    //    await txReceipt.wait();


    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    // const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=========================================================");

    console.log("usdc balance after swap tx", ethers.formatUnits(usdcBalAfter));
    console.log("eth balance after swap tx", ethers.formatUnits(ethBalAfter));
    // console.log("dai balance after add liquidity", Number(daiBalAfter));

    // console.log("=========================================================");

    // console.log("usdc swapped or liquidity added",Number(usdcBal) - Number(usdcBalAfter));
    // console.log("eth swapped or liquidity added", Number(ethBal) - Number(ethBalAfter));
    // console.log("dai swapped or liquidity added/removed", Number(daiBal) - Number(daiBalAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
