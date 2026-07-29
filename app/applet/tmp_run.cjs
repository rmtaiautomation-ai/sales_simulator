const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const gridRepl = `                {/* Triple Grid Config Display */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-8">
                  {/* Solar Owner Config Cards */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full tracking-wider inline-block">
                          Trigger: "solar"
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Persona 1: Mike</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3">Solar Company Owner / Operator</p>
                      
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                        <p className="text-slate-900 font-bold">"Solar Engine" Booking Bot</p>
                        <p className="text-slate-600 font-medium">$497/mo fee + $100 per booked qualified appt</p>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed font-sans">
                        Highly skeptical business owner who despises agency buzzwords. Tired of junk leads (renters, FICO under 650). Concerned about reputation and how the AI voice agent handles technical local guidelines like NEM 3.0 net metering.
                      </p>
                    </div>
                    <button
                      onClick={() => selectAndCallPersona('solar')}
                      className="w-full mt-5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>Select & Call Mike</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Standard Video Config */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-100 rounded-full tracking-wider inline-block self-start">
                          Triggers: "plumbing videos", "hvac videos", "roofing videos", "remodeling videos"
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Persona 2: Rick (Standard)</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3">General Trade Contractor</p>
                      
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                        <p className="text-slate-900 font-bold">Pure Video Content Creation</p>
                        <p className="text-slate-600 font-medium">$297/mo fee (raw edited shorts)</p>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed font-sans">
                        Extremely busy concrete contractor. Rick hates the thought of dancing on camera or acting like an influencer, or paying hundreds for generic corporate stock footage that local high-ticket buyers laugh at.
                      </p>
                    </div>
                    <button
                      onClick={() => selectAndCallPersona('video_standard')}
                      className="w-full mt-5 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>Select & Call Rick</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Social Pro Video Config */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-full tracking-wider inline-block self-start">
                          Triggers: "plumbing social pro", "hvac social pro", "roofing social pro", "remodeling social pro"
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Persona 3: Rick (Social Pro)</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3">General Trade Contractor</p>
                      
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1 text-slate-700 font-sans">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Offer to Pitch:</p>
                        <p className="text-slate-900 font-bold">"Social Pro" Video + Full Posting</p>
                        <p className="text-slate-600 font-medium">$497/mo fee (cancel anytime)</p>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        4 long videos + 4 short clips posted 2x/week across IG, FB, and X with local hashtags. Rick fears zero trackable financial ROI, contracts, or losing his authentic voice.
                      </p>
                    </div>
                    <button
                      onClick={() => selectAndCallPersona('video_social_pro')}
                      className="w-full mt-5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>Select & Call Rick (Social Pro)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Center Call to Action */}`;

const regexGridBlock = /\{\/\* Triple Grid Config Display \/\*\}[\s\S]*?\{\/\* Center Call to Action \/\*\}/;
if (regexGridBlock.test(content)) {
  console.log("Replacing Triple Grid block...");
  content = content.replace(regexGridBlock, gridRepl);
} else {
  console.log("Regex didn't match directly, trying alternate fallback...");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Finished running tmp_run.cjs!");
