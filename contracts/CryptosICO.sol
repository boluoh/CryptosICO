// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "./Cryptos.sol";

contract CryptosICO is Cryptos {
    using SafeMath for uint256;

    address public admin;
    address payable public deposit;
    uint tokenPrice = 0.001 ether;
    uint public hardCap = 300 ether;
    uint public raisedAmount;
    uint public saleStart = block.timestamp;
    uint public saleEnd = block.timestamp + 604800;
    uint public tokenTradeStart = saleEnd + 604800;
    uint public maxInvestment = 5 ether;
    uint public minInvestment = 0.1 ether;

    enum State {
        beforeStart,
        running,
        afterEnd,
        halted
    }

    State public icoState;

    constructor(address payable _deposit) {
        deposit = _deposit;
        admin = msg.sender;
        icoState = State.beforeStart;
    }

    modifier onlyadmin() {
        require(msg.sender == admin);
        _;
    }

    modifier runningState() {
        icoState = getCurrentState();
        require(icoState == State.running, "icoState is not runnning");
        _;
    }

    modifier validInvestValue() {
        require(
            msg.value >= minInvestment && msg.value <= maxInvestment,
            "invest value must in 0.1 ether and 5 ether"
        );
        _;
    }

    function halt() public onlyadmin {
        icoState = State.halted;
    }

    function resume() public onlyadmin {
        icoState = State.running;
    }

    function changeDepositAddress(address payable _deposit) public onlyadmin {
        deposit = _deposit;
    }

    function getCurrentState() public view returns (State) {
        if (State.halted == icoState) {
            return State.halted;
        } else if (block.timestamp < saleStart) {
            return State.beforeStart;
        } else if (block.timestamp >= saleStart && block.timestamp <= saleEnd) {
            return State.running;
        } else {
            return State.afterEnd;
        }
    }

    function invest()
        public
        payable
        runningState
        validInvestValue
        returns (bool)
    {
        require(raisedAmount + msg.value <= hardCap);

        uint tokens = msg.value / tokenPrice;

        balances[msg.sender] += tokens;
        balances[founder] -= tokens;

        deposit.transfer(msg.value);

        emit Invest(msg.sender, msg.value, tokens);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override returns (bool) {
        require(block.timestamp > tokenTradeStart);
        require(value <= balances[from]);
        require(value <= _allowed[from][msg.sender]);
        require(to != address(0));
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(value);
        emit Transfer(from, to, value);
        return true;
    }

    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        require(block.timestamp > tokenTradeStart);
        require(value <= balances[msg.sender]);
        require(to != address(0));

        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[to] = balances[to].add(value);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    receive() external payable {
        invest();
    }

    event Invest(address investor, uint value, uint tokens);
}
