import { useEffect, useState, useCallback } from "react";
import "./App.css";

const paymentFrequencies = {
  Weekly: 52,
  "Bi-weekly": 26,
  Monthly: 12,
  "Semi-monthly": 24,
  Quarterly: 4,
  Annually: 1,
};

const MortgageCalculator = () => {
  const [state, setState] = useState({
    price: window.mortgageCalculatorData
      ? window.mortgageCalculatorData.price
      : 200000,
    downPaymentPercent: 5,
    downPaymentAmount: 0,
    cmhc: 0,
    paymentFrequency: "Monthly",
    amortization: 25,
    rate: 4.64,
    totalMortgage: 0,
    monthlyPayment: 0,
    downPaymentError: "",
  });

  const [accordionOpen, setAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setAccordionOpen(!accordionOpen);
  };

  const updateState = (newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const calculateCMHC = useCallback((price, downPaymentAmount) => {
    const downPaymentPercentage = (downPaymentAmount / price) * 100;
    let cmhcRate;

    if (downPaymentPercentage < 10) {
      cmhcRate = 0.04;
    } else if (downPaymentPercentage < 15) {
      cmhcRate = 0.031;
    } else if (downPaymentPercentage < 20) {
      cmhcRate = 0.028;
    } else {
      cmhcRate = 0; // No CMHC insurance required for down payments >= 20%
    }

    return (price - downPaymentAmount) * cmhcRate;
  }, []);

  const calculateTotalMortgage = useCallback(
    (price, downPaymentAmount, cmhc) => {
      return price - downPaymentAmount + cmhc;
    },
    []
  );

  const calculateMonthlyPayment = useCallback(
    (totalMortgage, rate, amortization, paymentFrequency) => {
      const monthlyRate = rate / 100 / 12;
      const numberOfPayments =
        amortization * paymentFrequencies[paymentFrequency];
      return (
        (totalMortgage * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -numberOfPayments))
      );
    },
    []
  );

  useEffect(() => {
    let minDownPayment;
    let downPaymentPercent;

    if (state.price <= 500000) {
      minDownPayment = state.price * 0.05;
      downPaymentPercent = 5;
    } else if (state.price < 1000000) {
      minDownPayment = 500000 * 0.05 + (state.price - 500000) * 0.1;
      downPaymentPercent = (minDownPayment / state.price) * 100;
    } else {
      minDownPayment = state.price * 0.2;
      downPaymentPercent = 20;
    }

    setState((prevState) => ({
      ...prevState,
      downPaymentAmount: minDownPayment,
      downPaymentPercent: downPaymentPercent,
    }));
  }, []);

  useEffect(() => {
    const cmhc = calculateCMHC(state.price, state.downPaymentAmount);
    const totalMortgage = calculateTotalMortgage(
      state.price,
      state.downPaymentAmount,
      cmhc
    );
    const monthlyPayment = calculateMonthlyPayment(
      totalMortgage,
      state.rate,
      state.amortization,
      state.paymentFrequency
    );

    updateState({
      cmhc,
      totalMortgage: totalMortgage.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
    });
  }, [
    state.price,
    state.downPaymentAmount,
    state.rate,
    state.paymentFrequency,
    state.amortization,
    calculateCMHC,
    calculateTotalMortgage,
    calculateMonthlyPayment,
  ]);

  const onPriceChange = (value) => {
    if (value < 0) return;
    updateState({ price: value });
  };

  const validateDownPayment = (price, value) => {
    let minDownPayment;

    if (price <= 500000) {
      minDownPayment = price * 0.05;
    } else if (price < 1000000) {
      minDownPayment = 500000 * 0.05 + (price - 500000) * 0.1;
    } else {
      minDownPayment = price * 0.2;
    }

    if (value < minDownPayment) {
      return {
        error: `Minimum down payment for this price is $${minDownPayment.toFixed(
          2
        )}`,
        downPaymentAmount: value,
        downPaymentPercent: (value / price) * 100,
      };
    } else {
      return {
        error: "",
        downPaymentAmount: value,
        downPaymentPercent: (value / price) * 100,
      };
    }
  };

  const onDownPaymentChange = (e) => {
    const value = parseFloat(e.target.value);
    const { price } = state;
    let result;

    if (e.target.id === "downPaymentNumber") {
      result = validateDownPayment(price, value);
    } else if (e.target.id === "downPaymentPercentage") {
      const downPaymentValue = (value / 100) * price;
      result = validateDownPayment(price, downPaymentValue);
    }

    updateState({
      downPaymentError: result.error,
      downPaymentAmount: result.downPaymentAmount,
      downPaymentPercent: result.downPaymentPercent,
    });
  };

  const onAmortizationChange = (value) => {
    const year = value.target.value;
    if (year <= 0) return;
    updateState({ amortization: year });
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CAD",
  });

  return (
    <div id="mortgage-calculator" className="accordion-header">
      <div
        className="flex flex-row"
        style={{ justifyContent: "space-between" }}
      >
        <h2>Mortgage Calculator</h2>
        <div
          className="mobile-open"
          style={{ fontSize: "14px", cursor: "pointer", color: "#197fe6" }}
          onClick={toggleAccordion}
        >
          {accordionOpen && "View Less"}
          {!accordionOpen && "View More"}
        </div>
      </div>
      <div className={`accordion-content ${accordionOpen ? "active" : ""}`}>
        <div className="flex-col">
          <div className="flex-row">
            <label htmlFor="price">Price ($):</label>
            <input
              type="number"
              id="price"
              name="price"
              value={state.price}
              onChange={(e) => onPriceChange(e.target.value)}
            />
          </div>

          <div className="flex-row">
            <label htmlFor="downPayment">Down Payment (%):</label>

            <input
              type="number"
              id="downPaymentPercentage"
              name="downPaymentPercentage"
              value={state.downPaymentPercent}
              onChange={(e) => onDownPaymentChange(e)}
            />
          </div>
          <div className="flex-row">
            <label>Down Payment</label>

            <input
              type="number"
              id="downPaymentNumber"
              name="downPaymentNumber"
              value={state.downPaymentAmount}
              onChange={(e) => onDownPaymentChange(e)}
            />
          </div>

          <div className="flex-row">
            <label>
              CMHC insurance
              <span className="tooltip">
                ?
                <span className="tooltiptext">
                  Mortgage default insurance, commonly referred to as CMHC
                  insurance, protects the lender in the case the borrower
                  defaults on the mortgage. Mortgage default insurance is
                  required on all mortgages with down payments of less than 20%.
                  Mortgage default insurance is calculated as a percentage
                  applied to your mortgage amount.
                </span>
              </span>
            </label>
            <label style={{ textAlign: "start" }}>{state.cmhc}</label>
          </div>

          <div className="flex-row">
            <label>Total mortgage</label>
            <label>{state.totalMortgage}</label>
          </div>
          {state.downPaymentError && (
            <div className="error">{state.downPaymentError}</div>
          )}
          <div className="flex-row flex">
            <label className="items-center" htmlFor="amortization">
              Amortization (years):
            </label>
            <input
              type="number"
              id="amortization"
              name="amortization"
              value={state.amortization}
              onChange={(value) => onAmortizationChange(value)}
            />
          </div>
        </div>

        <div className="flex-row">
          <label htmlFor="rate">Mortgage Rate (%):</label>

          <input
            type="number"
            id="rate"
            name="rate"
            value={state.rate}
            step="0.01"
            onChange={(e) => updateState({ rate: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label htmlFor="paymentFrequency">Payment Frequency:</label>

          <select
            id="paymentFrequency"
            name="paymentFrequency"
            value={state.paymentFrequency}
            onChange={(e) => updateState({ paymentFrequency: e.target.value })}
          >
            {Object.keys(paymentFrequencies).map((frequency, index) => (
              <option key={index} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p style={{ fontWeight: "bold" }}>Payment: ${state.monthlyPayment}</p>
        </div>
      </div>

      <div
        className={`accordion-content-preview${accordionOpen ? "-none" : ""} `}
      >
        <div style={{ width: "100%" }}>
          <div>Price: {formatter.format(state.price)}</div>
          <div>
            {`${state.downPaymentPercent}% `}Down Payment:{" "}
            {formatter.format(state.downPaymentAmount)}
          </div>
          <div>Mortgage Rate: {state.rate}</div>
          <div>Payment Frequency: {state.paymentFrequency}</div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "start",
            fontSize: "2rem",
          }}
        >
          <h3 style={{ fontWeight: "bold", alignItems: "start" }}>
            {`Expected ${state.paymentFrequency} Payment`}
            <br />
            {formatter.format(state.monthlyPayment)}
          </h3>
        </div>
      </div>

      <p className="disclaimer">
        The mortgage calculator is not accurate and is for illustrative and
        general information purposes only. It is not intended to provide
        specific financial or other advice, and should not be relied upon in
        that regard.
      </p>
    </div>
  );
};

export default MortgageCalculator;
