import React from 'react';
import { DollarSign, Clock, Truck, TrendingUp } from 'lucide-react';
import { generateMockROIData } from '../utils/automationData';

export const AutomationROI: React.FC = () => {
  const roi = generateMockROIData();

  const monthlyDowntime = roi.downtimeAvoided / roi.periodDays * 30;
  const monthlyTruckRolls = roi.truckRollsPrevented / roi.periodDays * 30;
  const monthlyRevenue = roi.revenueProtected / roi.periodDays * 30;

  // Cost estimations (typical telecom values)
  const costPerHourDowntime = 50000; // dollars
  const costPerTruckRoll = 2500; // dollars
  const annualDowntimeAvoidance = (monthlyDowntime * costPerHourDowntime * 12) / 1000000;
  const annualTruckRollSavings = (monthlyTruckRolls * costPerTruckRoll * 12) / 1000000;

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-gray-900">Automation ROI</h2>
      </div>

      {/* Period Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs text-gray-600 font-semibold">Reporting Period</p>
        <p className="text-sm font-bold text-gray-900 mt-1">Last {roi.periodDays} Days</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-3">
        {/* Downtime Avoided */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Downtime Avoided
              </p>
              <p className="text-3xl font-black text-blue-600 mt-2">{roi.downtimeAvoided.toFixed(1)}</p>
              <p className="text-xs text-blue-700 mt-1">hours (last {roi.periodDays} days)</p>
              <p className="text-sm text-blue-700 font-bold mt-2">
                ~{monthlyDowntime.toFixed(1)} hrs/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-700 font-semibold">Est. Annual Savings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">${annualDowntimeAvoidance.toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Truck Rolls Prevented */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                <Truck className="w-3 h-3" /> Truck Rolls Prevented
              </p>
              <p className="text-3xl font-black text-green-600 mt-2">{roi.truckRollsPrevented}</p>
              <p className="text-xs text-green-700 mt-1">dispatches (last {roi.periodDays} days)</p>
              <p className="text-sm text-green-700 font-bold mt-2">
                ~{monthlyTruckRolls.toFixed(0)} dispatches/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-700 font-semibold">Est. Annual Savings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${annualTruckRollSavings.toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Revenue Protected */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Revenue Protected
              </p>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                ${(roi.revenueProtected / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-emerald-700 mt-1">(last {roi.periodDays} days)</p>
              <p className="text-sm text-emerald-700 font-bold mt-2">
                ~${(monthlyRevenue / 1000000).toFixed(2)}M/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-semibold">Annual Extrapolation</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ${((monthlyRevenue * 12) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-4">Detailed Breakdown</p>
        <div className="space-y-3">
          {[
            {
              label: 'Downtime Prevention',
              value: roi.downtimeAvoided.toFixed(1),
              unit: 'hours',
              icon: '⏱️',
              breakdown: [
                `Cost per hour: $${(costPerHourDowntime / 1000).toFixed(0)}K`,
                `Total saved: $${((roi.downtimeAvoided * costPerHourDowntime) / 1000000).toFixed(2)}M`
              ]
            },
            {
              label: 'Truck Roll Reduction',
              value: roi.truckRollsPrevented,
              unit: 'dispatches prevented',
              icon: '🚛',
              breakdown: [
                `Cost per dispatch: $${costPerTruckRoll.toLocaleString()}`,
                `Total saved: $${((roi.truckRollsPrevented * costPerTruckRoll) / 1000).toFixed(0)}K`
              ]
            },
            {
              label: 'Customer Retention',
              value: (roi.revenueProtected / 1000000).toFixed(2),
              unit: 'Million USD',
              icon: '👥',
              breakdown: [
                'Prevented churn from SLA violations',
                'Maintained customer satisfaction scores'
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span> {item.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>{item.value}</strong> {item.unit}
                  </p>
                </div>
              </div>
              <div className="space-y-1 ml-6">
                {item.breakdown.map((line, bidx) => (
                  <p key={bidx} className="text-xs text-gray-700">
                    • {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Annual Projection */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white">
        <p className="text-xs font-semibold opacity-90">Total Annual Projected Value</p>
        <p className="text-4xl font-black mt-2">
          ${(annualDowntimeAvoidance + annualTruckRollSavings + (monthlyRevenue * 12) / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs opacity-90 mt-2">
          Based on current automation performance and market rates
        </p>
      </div>

      {/* Impact Statement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Business Impact</p>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>✓ Reduced unplanned downtime by {Math.round((roi.downtimeAvoided / 200) * 100)}%</li>
          <li>✓ Eliminated manual truck dispatches for {roi.truckRollsPrevented} incidents</li>
          <li>✓ Protected ${(roi.revenueProtected / 1000000).toFixed(1)}M in potential revenue loss</li>
          <li>✓ Improved network availability to {(100 - (roi.downtimeAvoided / 240) * 100).toFixed(2)}%</li>
        </ul>
      </div>

      {/* ROI Calculation Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-amber-900 mb-1">📊 How ROI is Calculated</p>
        <p className="text-xs text-amber-800">
          Values based on industry standard telecom operations costs: $50K/hour downtime, $2.5K/truck
          roll. Actuals may vary by region and customer SLA terms.
        </p>
      </div>
    </div>
  );
};
