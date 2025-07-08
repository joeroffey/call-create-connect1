
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoofTilesCalculatorProps {
  onBack: () => void;
}

const RoofTilesCalculator = ({ onBack }: RoofTilesCalculatorProps) => {
  const [roofLength, setRoofLength] = useState('');
  const [roofWidth, setRoofWidth] = useState('');
  const [roofPitch, setRoofPitch] = useState('');
  const [tileType, setTileType] = useState('');
  const [results, setResults] = useState<any>(null);

  const tileTypes = {
    'concrete-interlocking': { name: 'Concrete Interlocking', coverage: 9.9 },
    'clay-plain': { name: 'Clay Plain Tiles', coverage: 60 },
    'clay-pantile': { name: 'Clay Pantiles', coverage: 13.2 },
    'slate-welsh': { name: 'Welsh Slate', coverage: 21 },
    'fibre-cement': { name: 'Fibre Cement', coverage: 12.5 }
  };

  const calculateRoof = () => {
    if (!roofLength || !roofWidth || !roofPitch || !tileType) return;

    const length = parseFloat(roofLength);
    const width = parseFloat(roofWidth);
    const pitch = parseFloat(roofPitch);
    const selectedTile = tileTypes[tileType as keyof typeof tileTypes];

    // Calculate roof area accounting for pitch
    const pitchFactor = Math.cos(pitch * Math.PI / 180);
    const roofArea = (length * width) / pitchFactor;

    // Calculate tiles needed (with 10% waste)
    const tilesNeeded = Math.ceil((roofArea * selectedTile.coverage) * 1.1);

    // Calculate battens (25x38mm at 345mm centres for most tiles)
    const battenSpacing = tileType === 'clay-plain' ? 0.19 : 0.345; // metres
    const numberOfBattens = Math.ceil(width / battenSpacing);
    const battenLength = numberOfBattens * length * 2; // Both sides of roof

    // Calculate underlay (with 10% waste)
    const underlayArea = roofArea * 1.1;
    const underlayRolls = Math.ceil(underlayArea / 50); // 50m² per roll

    // Ridge tiles (approximate)
    const ridgeLength = length;
    const ridgeTiles = Math.ceil(ridgeLength / 0.45); // 450mm ridge tiles

    setResults({
      roofArea: roofArea.toFixed(1),
      tilesNeeded,
      battenLength: battenLength.toFixed(1),
      underlayRolls,
      ridgeTiles,
      selectedTile: selectedTile.name
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
              <Home className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-1xl md:text-2xl font-bold text-white">UK Roof Tiles Calculator</h1>
              <p className="text-gray-400 text-sm">Calculate roof tile quantities and materials</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-400" />
                Roof Measurements
              </CardTitle>
              <CardDescription>Enter your roof dimensions and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roof-length" className="text-white">Roof Length (m)</Label>
                  <Input
                    id="roof-length"
                    type="number"
                    placeholder="12.0"
                    value={roofLength}
                    onChange={(e) => setRoofLength(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="roof-width" className="text-white">Roof Width (m)</Label>
                  <Input
                    id="roof-width"
                    type="number"
                    placeholder="8.0"
                    value={roofWidth}
                    onChange={(e) => setRoofWidth(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roof-pitch" className="text-white">Roof Pitch (degrees)</Label>
                <Input
                  id="roof-pitch"
                  type="number"
                  placeholder="30"
                  value={roofPitch}
                  onChange={(e) => setRoofPitch(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="tile-type" className="text-white">Tile Type</Label>
                <Select value={tileType} onValueChange={setTileType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select tile type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(tileTypes).map(([key, tile]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                        {tile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={calculateRoof}
                disabled={!roofLength || !roofWidth || !roofPitch || !tileType}
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
                  <CardDescription>For {results.selectedTile}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Roof Area:</span>
                      <p className="text-white font-medium">{results.roofArea} m²</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Tiles Needed:</span>
                      <p className="text-white font-medium">{results.tilesNeeded} units</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Batten Length:</span>
                      <p className="text-white font-medium">{results.battenLength} m</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Underlay Rolls:</span>
                      <p className="text-white font-medium">{results.underlayRolls} rolls</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Ridge Tiles:</span>
                      <p className="text-white font-medium">{results.ridgeTiles} units</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Calculations include 10% waste allowance. 
                  Always confirm measurements and consult with roofing professionals.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoofTilesCalculator;
