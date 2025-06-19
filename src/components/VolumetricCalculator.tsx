
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VolumetricCalculatorProps {
  onBack: () => void;
}

const VolumetricCalculator = ({ onBack }: VolumetricCalculatorProps) => {
  const [concreteInputs, setConcreteInputs] = useState({
    length: '',
    width: '',
    depth: ''
  });
  
  const [excavationInputs, setExcavationInputs] = useState({
    length: '',
    width: '',
    depth: ''
  });
  
  const [cylindricalInputs, setCylindricalInputs] = useState({
    diameter: '',
    height: ''
  });

  const calculateRectangularVolume = (length: number, width: number, depth: number) => {
    return length * width * depth;
  };

  const calculateCylindricalVolume = (diameter: number, height: number) => {
    const radius = diameter / 2;
    return Math.PI * radius * radius * height;
  };

  const calculateConcreteMaterials = (volume: number) => {
    // Standard concrete mix ratios (1:2:4 - cement:sand:aggregate)
    const cementBags = Math.ceil(volume * 7); // Approximately 7 bags per cubic meter
    const sandTonnes = (volume * 0.5).toFixed(2); // 0.5 tonnes per cubic meter
    const aggregateTonnes = (volume * 1.0).toFixed(2); // 1 tonne per cubic meter
    
    return {
      cementBags,
      sandTonnes,
      aggregateTonnes
    };
  };

  const concreteVolume = concreteInputs.length && concreteInputs.width && concreteInputs.depth
    ? calculateRectangularVolume(
        parseFloat(concreteInputs.length),
        parseFloat(concreteInputs.width),
        parseFloat(concreteInputs.depth)
      )
    : 0;

  const excavationVolume = excavationInputs.length && excavationInputs.width && excavationInputs.depth
    ? calculateRectangularVolume(
        parseFloat(excavationInputs.length),
        parseFloat(excavationInputs.width),
        parseFloat(excavationInputs.depth)
      )
    : 0;

  const cylindricalVolume = cylindricalInputs.diameter && cylindricalInputs.height
    ? calculateCylindricalVolume(
        parseFloat(cylindricalInputs.diameter),
        parseFloat(cylindricalInputs.height)
      )
    : 0;

  const concreteMaterials = calculateConcreteMaterials(concreteVolume);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Volumetric Calculator</h1>
              <p className="text-gray-400 text-sm">Calculate volumes for building construction</p>
            </div>
          </div>
        </motion.div>

        {/* Calculator Tabs */}
        <Tabs defaultValue="concrete" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="concrete" className="data-[state=active]:bg-gray-700">Concrete</TabsTrigger>
            <TabsTrigger value="excavation" className="data-[state=active]:bg-gray-700">Excavation</TabsTrigger>
            <TabsTrigger value="cylindrical" className="data-[state=active]:bg-gray-700">Cylindrical</TabsTrigger>
          </TabsList>

          {/* Concrete Calculator */}
          <TabsContent value="concrete">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-blue-400" />
                    Concrete Volume
                  </CardTitle>
                  <CardDescription>Calculate concrete volume and material requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="concrete-length" className="text-white">Length (m)</Label>
                      <Input
                        id="concrete-length"
                        type="number"
                        placeholder="Enter length"
                        value={concreteInputs.length}
                        onChange={(e) => setConcreteInputs({ ...concreteInputs, length: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="concrete-width" className="text-white">Width (m)</Label>
                      <Input
                        id="concrete-width"
                        type="number"
                        placeholder="Enter width"
                        value={concreteInputs.width}
                        onChange={(e) => setConcreteInputs({ ...concreteInputs, width: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="concrete-depth" className="text-white">Depth/Thickness (m)</Label>
                      <Input
                        id="concrete-depth"
                        type="number"
                        placeholder="Enter depth"
                        value={concreteInputs.depth}
                        onChange={(e) => setConcreteInputs({ ...concreteInputs, depth: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{concreteVolume.toFixed(2)} m³</div>
                      <div className="text-sm text-gray-400">Total Volume</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Material Requirements:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cement:</span>
                        <span className="text-white font-medium">{concreteMaterials.cementBags} bags</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sand:</span>
                        <span className="text-white font-medium">{concreteMaterials.sandTonnes} tonnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Aggregate:</span>
                        <span className="text-white font-medium">{concreteMaterials.aggregateTonnes} tonnes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-300">
                      Based on 1:2:4 mix ratio. Add 10% extra for wastage.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Excavation Calculator */}
          <TabsContent value="excavation">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-green-400" />
                    Excavation Volume
                  </CardTitle>
                  <CardDescription>Calculate earth removal and backfill requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="excavation-length" className="text-white">Length (m)</Label>
                      <Input
                        id="excavation-length"
                        type="number"
                        placeholder="Enter length"
                        value={excavationInputs.length}
                        onChange={(e) => setExcavationInputs({ ...excavationInputs, length: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excavation-width" className="text-white">Width (m)</Label>
                      <Input
                        id="excavation-width"
                        type="number"
                        placeholder="Enter width"
                        value={excavationInputs.width}
                        onChange={(e) => setExcavationInputs({ ...excavationInputs, width: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excavation-depth" className="text-white">Depth (m)</Label>
                      <Input
                        id="excavation-depth"
                        type="number"
                        placeholder="Enter depth"
                        value={excavationInputs.depth}
                        onChange={(e) => setExcavationInputs({ ...excavationInputs, depth: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{excavationVolume.toFixed(2)} m³</div>
                      <div className="text-sm text-gray-400">Earth to Remove</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Estimates:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Truck loads (7m³):</span>
                        <span className="text-white font-medium">{Math.ceil(excavationVolume / 7)} loads</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Backfill required:</span>
                        <span className="text-white font-medium">{(excavationVolume * 0.8).toFixed(2)} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Compacted volume:</span>
                        <span className="text-white font-medium">{(excavationVolume * 0.75).toFixed(2)} m³</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                      Estimates based on typical soil conditions. Add safety margins.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cylindrical Calculator */}
          <TabsContent value="cylindrical">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-purple-400" />
                    Cylindrical Volume
                  </CardTitle>
                  <CardDescription>Calculate volume for columns, pipes, tanks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cylindrical-diameter" className="text-white">Diameter (m)</Label>
                      <Input
                        id="cylindrical-diameter"
                        type="number"
                        placeholder="Enter diameter"
                        value={cylindricalInputs.diameter}
                        onChange={(e) => setCylindricalInputs({ ...cylindricalInputs, diameter: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cylindrical-height" className="text-white">Height (m)</Label>
                      <Input
                        id="cylindrical-height"
                        type="number"
                        placeholder="Enter height"
                        value={cylindricalInputs.height}
                        onChange={(e) => setCylindricalInputs({ ...cylindricalInputs, height: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{cylindricalVolume.toFixed(2)} m³</div>
                      <div className="text-sm text-gray-400">Cylindrical Volume</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Additional Info:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Surface area:</span>
                        <span className="text-white font-medium">
                          {cylindricalInputs.diameter && cylindricalInputs.height
                            ? (2 * Math.PI * (parseFloat(cylindricalInputs.diameter) / 2) * parseFloat(cylindricalInputs.height)).toFixed(2)
                            : '0.00'} m²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Circumference:</span>
                        <span className="text-white font-medium">
                          {cylindricalInputs.diameter
                            ? (Math.PI * parseFloat(cylindricalInputs.diameter)).toFixed(2)
                            : '0.00'} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Base area:</span>
                        <span className="text-white font-medium">
                          {cylindricalInputs.diameter
                            ? (Math.PI * Math.pow(parseFloat(cylindricalInputs.diameter) / 2, 2)).toFixed(2)
                            : '0.00'} m²
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-300">
                      Perfect for columns, water tanks, and circular structures.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VolumetricCalculator;
