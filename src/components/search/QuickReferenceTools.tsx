
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, CheckSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const QuickReferenceTools = () => {
  const [regulationCode, setRegulationCode] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleRegulationLookup = () => {
    // Mock lookup result
    setLookupResult({
      code: regulationCode,
      title: 'Part B - Fire Safety Requirements',
      description: 'Requirements for fire safety provisions in buildings including escape routes, fire resistance, and alarm systems.',
      sections: ['B1 - Means of warning', 'B2 - Internal fire spread', 'B3 - External fire spread']
    });
  };

  const quickCalculators = [
    {
      id: 'u-value',
      title: 'U-Value Calculator',
      description: 'Calculate thermal transmittance for building elements',
      icon: Calculator
    },
    {
      id: 'fire-escape',
      title: 'Fire Escape Distance',
      description: 'Calculate maximum travel distances for fire escape routes',
      icon: Calculator
    },
    {
      id: 'ventilation',
      title: 'Ventilation Rate',
      description: 'Calculate required ventilation rates for different spaces',
      icon: Calculator
    }
  ];

  const complianceChecklists = [
    {
      id: 'new-build',
      title: 'New Build Residential',
      description: 'Complete checklist for new residential construction',
      items: 12
    },
    {
      id: 'extension',
      title: 'House Extension',
      description: 'Requirements for residential extensions',
      items: 8
    },
    {
      id: 'commercial',
      title: 'Commercial Building',
      description: 'Commercial building compliance checklist',
      items: 15
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 mb-6">
          <TabsTrigger value="lookup" className="data-[state=active]:bg-gray-700">Regulation Lookup</TabsTrigger>
          <TabsTrigger value="calculators" className="data-[state=active]:bg-gray-700">Calculators</TabsTrigger>
          <TabsTrigger value="checklists" className="data-[state=active]:bg-gray-700">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="lookup">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-400" />
                Quick Regulation Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="reg-code" className="text-white">Regulation Code or Reference</Label>
                  <Input
                    id="reg-code"
                    placeholder="e.g., Part B, B1, A1/2, etc."
                    value={regulationCode}
                    onChange={(e) => setRegulationCode(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button
                  onClick={handleRegulationLookup}
                  disabled={!regulationCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 mt-6"
                >
                  Lookup
                </Button>
              </div>

              {lookupResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                >
                  <h3 className="text-white font-semibold mb-2">{lookupResult.title}</h3>
                  <p className="text-gray-300 mb-3">{lookupResult.description}</p>
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Related Sections:</h4>
                    <ul className="space-y-1">
                      {lookupResult.sections.map((section: string, index: number) => (
                        <li key={index} className="text-gray-400 text-sm">• {section}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculators">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickCalculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <motion.div
                  key={calc.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center text-lg">
                        <Icon className="w-5 h-5 mr-2 text-blue-400" />
                        {calc.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4">{calc.description}</p>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        Open Calculator
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="checklists">
          <div className="grid gap-4 md:grid-cols-2">
            {complianceChecklists.map((checklist) => (
              <motion.div
                key={checklist.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-green-400" />
                        {checklist.title}
                      </div>
                      <span className="text-sm text-gray-400">{checklist.items} items</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{checklist.description}</p>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <FileText className="w-4 h-4 mr-2" />
                      View Checklist
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickReferenceTools;
