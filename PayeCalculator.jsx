
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PayeCalculator() {
  const [basic, setBasic] = useState(0);
  const [housing, setHousing] = useState(0);
  const [transport, setTransport] = useState(0);
  const [other, setOther] = useState(0);
  const [pensionRate, setPensionRate] = useState(8);
  const [period, setPeriod] = useState("monthly");
  const [result, setResult] = useState(null);

  const formatCurrency = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculatePAYE = () => {
    const gross = basic + housing + transport + other;
    const pension = (pensionRate / 100) * gross;
    const nhf = 0.025 * basic;

    const annualGross = period === "monthly" ? gross * 12 : gross;
    const annualPension = period === "monthly" ? pension * 12 : pension;
    const annualNhf = period === "monthly" ? nhf * 12 : nhf;

    // CRA = 20% of gross + max(₦200,000 or 1% of gross)
    const cra = 0.2 * annualGross + Math.max(200000, 0.01 * annualGross);

    const totalReliefs = cra + annualPension + annualNhf;
    const taxableIncome = Math.max(0, annualGross - totalReliefs);

    let remaining = taxableIncome;
    let tax = 0;
    const bands = [
      { limit: 300000, rate: 0.07 },
      { limit: 300000, rate: 0.11 },
      { limit: 500000, rate: 0.15 },
      { limit: 500000, rate: 0.19 },
      { limit: 1600000, rate: 0.21 },
      { limit: Infinity, rate: 0.24 },
    ];

    for (const band of bands) {
      const amount = Math.min(band.limit, remaining);
      tax += amount * band.rate;
      remaining -= amount;
      if (remaining <= 0) break;
    }

    const monthlyTax = tax / 12;

    setResult({
      gross,
      pension,
      nhf,
      cra,
      taxableIncome,
      annualTax: tax,
      monthlyTax,
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">BizEdge PAYE Tax Calculator</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Basic Salary (₦)</Label>
          <Input
            type="number"
            min={0}
            value={basic}
            onChange={(e) => setBasic(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Housing Allowance (₦)</Label>
          <Input
            type="number"
            min={0}
            value={housing}
            onChange={(e) => setHousing(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Transport Allowance (₦)</Label>
          <Input
            type="number"
            min={0}
            value={transport}
            onChange={(e) => setTransport(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Other Allowances (₦)</Label>
          <Input
            type="number"
            min={0}
            value={other}
            onChange={(e) => setOther(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Pension Contribution (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={pensionRate}
            onChange={(e) => setPensionRate(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Salary Type</Label>
          <select
            className="w-full border rounded p-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>

      <Button onClick={calculatePAYE}>Calculate PAYE</Button>

      {result && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p><strong>Gross Income:</strong> ₦{formatCurrency(result.gross)}</p>
            <p><strong>Pension Contribution:</strong> ₦{formatCurrency(result.pension)}</p>
            <p><strong>NHF Contribution (2.5% of Basic):</strong> ₦{formatCurrency(result.nhf)}</p>
            <p><strong>Consolidated Relief Allowance (CRA):</strong> ₦{formatCurrency(result.cra)}</p>
            <p><strong>Taxable Income:</strong> ₦{formatCurrency(result.taxableIncome)}</p>
            <p><strong>Annual PAYE:</strong> ₦{formatCurrency(result.annualTax)}</p>
            <p><strong>Monthly PAYE:</strong> ₦{formatCurrency(result.monthlyTax)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
