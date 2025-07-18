
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Calculator, Ruler, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReadyReckonerProps {
  onBack: () => void;
}

const ReadyReckoner = ({ onBack }: ReadyReckonerProps) => {
  const [convertValue, setConvertValue] = useState('');
  const [activeConverter, setActiveConverter] = useState('length');

  const lengthConversions = {
    millimeters: parseFloat(convertValue) || 0,
    centimeters: (parseFloat(convertValue) || 0) / 10,
    meters: (parseFloat(convertValue) || 0) / 1000,
    inches: (parseFloat(convertValue) || 0) / 25.4,
    feet: (parseFloat(convertValue) || 0) / 304.8
  };

  const areaConversions = {
    'square_meters': parseFloat(convertValue) || 0,
    'square_feet': (parseFloat(convertValue) || 0) * 10.764,
    'square_yards': (parseFloat(convertValue) || 0) * 1.196
  };

  const weightConversions = {
    'kilograms': parseFloat(convertValue) || 0,
    'tonnes': (parseFloat(convertValue) || 0) / 1000,
    'pounds': (parseFloat(convertValue) || 0) * 2.205,
    'tons_imperial': (parseFloat(convertValue) || 0) / 1016
  };

  const materialDensities = [
    { material: 'Concrete', density: '2400 kg/m³', weight: '2.4 tonnes/m³' },
    { material: 'Steel', density: '7850 kg/m³', weight: '7.85 tonnes/m³' },
    { material: 'Timber (Pine)', density: '500 kg/m³', weight: '0.5 tonnes/m³' },
    { material: 'Brick', density: '1920 kg/m³', weight: '1.92 tonnes/m³' },
    { material: 'Sand (dry)', density: '1600 kg/m³', weight: '1.6 tonnes/m³' },
    { material: 'Gravel', density: '1680 kg/m³', weight: '1.68 tonnes/m³' },
    { material: 'Topsoil', density: '1200 kg/m³', weight: '1.2 tonnes/m³' },
    { material: 'Water', density: '1000 kg/m³', weight: '1.0 tonne/m³' }
  ];

  const standardSizes = {
    timber: [
      { size: '70 x 35mm', use: 'Battens, small framing' },
      { size: '90 x 35mm', use: 'Wall frames, noggins' },
      { size: '90 x 45mm', use: 'Wall plates, lintels' },
      { size: '140 x 45mm', use: 'Floor joists, rafters' },
      { size: '190 x 45mm', use: 'Beams, large joists' },
      { size: '240 x 45mm', use: 'Large beams, posts' }
    ],
    steel: [
      { size: '75 x 75 x 6mm', use: 'Light angle brackets' },
      { size: '100 x 100 x 8mm', use: 'Standard angles' },
      { size: '150 x 90 x 12mm', use: 'Heavy duty angles' },
      { size: '200UB', use: 'Universal beams' },
      { size: '310UB', use: 'Heavy universal beams' }
    ]
  };

  const quickCalculations = [
    {
      title: 'Concrete Volume to Bags',
      formula: 'Volume (m³) × 7 = Cement bags needed',
      example: '1m³ concrete = 7 bags cement'
    },
    {
      title: 'Brick Wall Quantity',
      formula: 'Wall area (m²) × 50 = Standard bricks needed',
      example: '10m² wall = 500 bricks'
    },
    {
      title: 'Paint Coverage',
      formula: 'Surface area (m²) ÷ 10 = Litres needed (1 coat)',
      example: '100m² = 10 litres paint'
    },
    {
      title: 'Excavation to Trucks',
      formula: 'Volume (m³) ÷ 7 = Truck loads (7m³ trucks)',
      example: '35m³ = 5 truck loads'
    }
  ];

  return (
    <div className="h-full rounded-xl bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-1xl md:text-2xl font-bold text-white">Ready Reckoner</h1>
              <p className="text-gray-400 text-sm">Quick reference for construction calculations</p>
            </div>
          </div>
        </motion.div>

        {/* Reference Tabs */}
        <Tabs defaultValue="conversions" className="w-full">
          <TabsList className="w-full h-full flex flex-wrap md:grid md:grid-cols-4 gap-2 bg-gray-800 p-2 rounded-lg">
            <TabsTrigger value="conversions" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Conversions
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Materials
            </TabsTrigger>
            <TabsTrigger value="sizes" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Sizes
            </TabsTrigger>
            <TabsTrigger value="formulas" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Formulas
            </TabsTrigger>
          </TabsList>


          {/* Unit Conversions */}
          <TabsContent value="conversions">
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-blue-400" />
                    Unit Converter
                  </CardTitle>
                  <CardDescription>Convert between different units</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="convert-value" className="text-white">Enter value to convert</Label>
                    <Input
                      id="convert-value"
                      type="number"
                      placeholder="Enter value"
                      value={convertValue}
                      onChange={(e) => setConvertValue(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeConverter === 'length' ? 'default' : 'outline'}
                      onClick={() => setActiveConverter('length')}
                      className="text-xs"
                    >
                      Length
                    </Button>
                    <Button
                      variant={activeConverter === 'area' ? 'default' : 'outline'}
                      onClick={() => setActiveConverter('area')}
                      className="text-xs"
                    >
                      Area
                    </Button>
                    <Button
                      variant={activeConverter === 'weight' ? 'default' : 'outline'}
                      onClick={() => setActiveConverter('weight')}
                      className="text-xs"
                    >
                      Weight
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Conversion Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeConverter === 'length' && (
                    <div className="space-y-2">
                      {Object.entries(lengthConversions).map(([unit, value]) => (
                        <div key={unit} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{unit.replace('_', ' ')}:</span>
                          <span className="text-white font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConverter === 'area' && (
                    <div className="space-y-2">
                      {Object.entries(areaConversions).map(([unit, value]) => (
                        <div key={unit} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{unit.replace('_', ' ')}:</span>
                          <span className="text-white font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConverter === 'weight' && (
                    <div className="space-y-2">
                      {Object.entries(weightConversions).map(([unit, value]) => (
                        <div key={unit} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{unit.replace('_', ' ')}:</span>
                          <span className="text-white font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Material Properties */}
          <TabsContent value="materials">
            <Card className="bg-gray-800/50 mt-4 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Weight className="w-5 h-5 mr-2 text-green-400" />
                  Material Densities
                </CardTitle>
                <CardDescription>Common building material weights and densities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {materialDensities.map((item, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-white font-medium mb-2">{item.material}</h4>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">Density: <span className="text-white">{item.density}</span></div>
                        <div className="text-sm text-gray-400">Weight: <span className="text-white">{item.weight}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standard Sizes */}
          <TabsContent value="sizes">
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Ruler className="w-5 h-5 mr-2 text-orange-400" />
                    Timber Sizes
                  </CardTitle>
                  <CardDescription>Standard timber dimensions and uses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standardSizes.timber.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div>
                          <span className="text-white font-medium">{item.size}</span>
                        </div>
                        <div className="text-sm text-gray-400">{item.use}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Weight className="w-5 h-5 mr-2 text-gray-400" />
                    Steel Sizes
                  </CardTitle>
                  <CardDescription>Common steel section sizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standardSizes.steel.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div>
                          <span className="text-white font-medium">{item.size}</span>
                        </div>
                        <div className="text-sm text-gray-400">{item.use}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Formulas */}
          <TabsContent value="formulas">
            <Card className="bg-gray-800/50 mt-4 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-400" />
                  Quick Calculation Formulas
                </CardTitle>
                <CardDescription>Handy formulas for common construction calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickCalculations.map((calc, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-white font-medium mb-2">{calc.title}</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-purple-300 font-mono bg-purple-500/10 rounded p-2">
                          {calc.formula}
                        </div>
                        <div className="text-sm text-gray-400">
                          Example: {calc.example}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReadyReckoner;
