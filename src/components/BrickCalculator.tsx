import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrickCalculatorProps {
  onBack: () => void;
}

const BrickCalculator = ({ onBack }: BrickCalculatorProps) => {
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [wallThickness, setWallThickness] = useState('');
  const [brickType, setBrickType] = useState('');
  const [mortarType, setMortarType] = useState('');
  const [windowArea, setWindowArea] = useState('');
  const [doorArea, setDoorArea] = useState('');
  const [results, setResults] = useState<any>(null);

  const brickTypes = {
    'standard': { name: 'Standard Brick (215x102.5x65mm)', perM2: 59 },
    'engineering': { name: 'Engineering Brick', perM2: 59 },
    'facing-red': { name: 'Red Facing Brick', perM2: 59 },
    'facing-buff': { name: 'Buff Facing Brick', perM2: 59 },
    'reclaimed': { name: 'Reclaimed Stock Brick', perM2: 59 }
  };

  const mortarTypes = {
    'cement-lime': { name: 'Cement:Lime:Sand (1:1:6)', strengthN: 3.6 },
    'cement-sand': { name: 'Cement:Sand (1:4)', strengthN: 11 },
    'ready-mix': { name: 'Ready Mix Mortar', strengthN: 5.2 }
  };

  const calculateBrickwork = () => {
    if (!wallLength || !wallHeight || !wallThickness || !brickType || !mortarType) return;

    const length = parseFloat(wallLength);
    const height = parseFloat(wallHeight);
    const thickness = parseFloat(wallThickness);
    const windowAreaM2 = parseFloat(windowArea) || 0;
    const doorAreaM2 = parseFloat(doorArea) || 0;

    const selectedBrick = brickTypes[brickType as keyof typeof brickTypes];
    const selectedMortar = mortarTypes[mortarType as keyof typeof mortarTypes];

    // Calculate wall area
    const grossArea = length * height;
    const netArea = grossArea - windowAreaM2 - doorAreaM2;

    // Wall volume for different thicknesses
    const wallVolume = netArea * (thickness / 1000); // Convert mm to metres

    // Calculate bricks needed
    let bricksPerM2 = selectedBrick.perM2;
    if (thickness === 215) bricksPerM2 = 118; // Double thickness
    
    const bricksNeeded = Math.ceil(netArea * bricksPerM2 * 1.05); // 5% waste

    // Calculate mortar needed (approximately 0.02m³ per m² for single skin)
    const mortarVolume = netArea * (thickness === 215 ? 0.04 : 0.02);
    const mortarBags = Math.ceil(mortarVolume * 40); // 40 bags per m³

    // DPC (Damp Proof Course) - assume needed at base
    const dpcLength = length;

    // Wall ties (for cavity walls)
    const wallTies = thickness > 102.5 ? Math.ceil(netArea * 2.5) : 0; // 2.5 ties per m²

    // Sand and cement separate calculation
    const sandTonnes = mortarVolume * 1.8; // 1.8 tonnes sand per m³ mortar
    const cementBags = mortarVolume * 8; // 8 bags cement per m³ mortar

    setResults({
      wallArea: netArea.toFixed(1),
      wallVolume: wallVolume.toFixed(2),
      bricksNeeded,
      mortarBags,
      sandTonnes: sandTonnes.toFixed(2),
      cementBags: Math.ceil(cementBags),
      dpcLength: dpcLength.toFixed(1),
      wallTies,
      selectedBrick: selectedBrick.name,
      selectedMortar: selectedMortar.name,
      mortarStrength: selectedMortar.strengthN
    });
  };

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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/20">
              <Building2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-1xl md:text-2xl font-bold text-white">UK Brick Calculator</h1>
              <p className="text-gray-400 text-sm">Calculate brick quantities and masonry materials</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-400" />
                Wall Specifications
              </CardTitle>
              <CardDescription>Enter your wall dimensions and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wall-length" className="text-white">Wall Length (m)</Label>
                  <Input
                    id="wall-length"
                    type="number"
                    placeholder="10.0"
                    value={wallLength}
                    onChange={(e) => setWallLength(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="wall-height" className="text-white">Wall Height (m)</Label>
                  <Input
                    id="wall-height"
                    type="number"
                    placeholder="2.4"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="wall-thickness" className="text-white">Wall Thickness</Label>
                <Select value={wallThickness} onValueChange={setWallThickness}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select thickness" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="102.5" className="text-white hover:bg-gray-700">Half Brick (102.5mm)</SelectItem>
                    <SelectItem value="215" className="text-white hover:bg-gray-700">Full Brick (215mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brick-type" className="text-white">Brick Type</Label>
                <Select value={brickType} onValueChange={setBrickType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select brick type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(brickTypes).map(([key, brick]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                        {brick.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mortar-type" className="text-white">Mortar Type</Label>
                <Select value={mortarType} onValueChange={setMortarType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select mortar type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(mortarTypes).map(([key, mortar]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                        {mortar.name} - {mortar.strengthN}N/mm²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="window-area" className="text-white">Window Area (m²)</Label>
                  <Input
                    id="window-area"
                    type="number"
                    placeholder="0"
                    value={windowArea}
                    onChange={(e) => setWindowArea(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="door-area" className="text-white">Door Area (m²)</Label>
                  <Input
                    id="door-area"
                    type="number"
                    placeholder="0"
                    value={doorArea}
                    onChange={(e) => setDoorArea(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                onClick={calculateBrickwork}
                disabled={!wallLength || !wallHeight || !wallThickness || !brickType || !mortarType}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Calculate Materials
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Material Requirements</CardTitle>
                  <CardDescription>{results.selectedBrick}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Wall Area:</span>
                      <p className="text-white font-medium">{results.wallArea} m²</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Bricks Needed:</span>
                      <p className="text-white font-medium">{results.bricksNeeded} units</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Mortar Bags:</span>
                      <p className="text-white font-medium">{results.mortarBags} bags</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Sand Required:</span>
                      <p className="text-white font-medium">{results.sandTonnes} tonnes</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cement Bags:</span>
                      <p className="text-white font-medium">{results.cementBags} bags</p>
                    </div>
                    {results.wallTies > 0 && (
                      <div>
                        <span className="text-gray-400">Wall Ties:</span>
                        <p className="text-white font-medium">{results.wallTies} units</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Calculations include 5% waste allowance for bricks. 
                  Mortar strength: {results.mortarStrength}N/mm². 
                  Always confirm with suppliers and building control.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrickCalculator;
