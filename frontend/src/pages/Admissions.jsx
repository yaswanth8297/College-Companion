import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Award, 
  HelpCircle, 
  Info,
  ExternalLink
} from 'lucide-react';
import { getAdmissions } from '../services/api';

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdmissions();
        setAdmissions(data);
        if (data.length > 0) setSelectedAdmission(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9DCD59]/25 text-[#2D5A12] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>AP EAPCET Code: DLBC • Admissions Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1C1E] tracking-tight">
            Admissions & Student Eligibility
          </h1>
          <p className="text-sm text-[#4A5568] max-w-2xl leading-relaxed">
            Detailed criteria, required documents, government reservation benefits, and fee regulatory guidelines for aspiring engineering students.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2">
          {admissions.map((adm) => (
            <button
              key={adm.id}
              onClick={() => setSelectedAdmission(adm)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedAdmission?.id === adm.id
                  ? 'bg-[#EF83B9] text-white shadow-xs'
                  : 'bg-white text-[#4A5568] border border-[#E3DFD3] hover:bg-[#E3DFD3]'
              }`}
            >
              {adm.category}
            </button>
          ))}
        </div>

        {/* Details Card */}
        {selectedAdmission && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E3DFD3] pb-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EF83B9]">
                {selectedAdmission.category}
              </span>
              <h2 className="text-2xl font-bold text-[#1A1C1E]">
                {selectedAdmission.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed pt-1">
                {selectedAdmission.description}
              </p>
            </div>

            {/* Eligibility Requirements */}
            <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#9DCD59]" />
                <span>Eligibility Criteria</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {selectedAdmission.eligibility_criteria}
              </p>
            </div>

            {/* Admission Procedure */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                Counselling & Selection Procedure
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {selectedAdmission.admission_procedure}
              </p>
            </div>

            {/* Required Documents Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#EF83B9]" />
                <span>Required Certificates & Verification Checklist</span>
              </h3>
              <div className="p-4 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] text-xs text-[#4A5568] leading-relaxed">
                {selectedAdmission.required_documents}
              </div>
            </div>

            {/* Tuition Fees & Scholarships info with verified indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-1.5">
                <h4 className="font-bold text-xs text-[#1A1C1E]">Fee Guidelines</h4>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  {selectedAdmission.fee_details}
                </p>
                <span className="text-[10px] text-[#718096] block pt-1">
                  *Regulated by AP Higher Education Regulatory & Monitoring Commission.
                </span>
              </div>

              <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-1.5">
                <h4 className="font-bold text-xs text-[#1A1C1E]">Government Scholarships</h4>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  {selectedAdmission.scholarships_info}
                </p>
                <span className="text-[10px] text-[#2D5A12] block pt-1 font-semibold">
                  Jagananna Vidya Deevena & Merit Concessions Applicable.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
