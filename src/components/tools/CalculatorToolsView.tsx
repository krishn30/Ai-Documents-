import React, { useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  Award,
  Percent,
  Calculator as CalcIcon,
  BarChart2,
  RefreshCw,
  Divide,
  TrendingUp,
  Tag,
  Calendar,
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  calculateAttendance,
  calculateGPA,
  calculateCGPA,
  calculateTargetGPA,
  calculatePercentOf,
  calculateWhatPercent,
  calculatePercentChange,
  calculateStatistics,
  calculateFractions,
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateDiscount,
  calculateAge,
  calculateBMI,
  CourseGrade,
} from '../../utils/calculatorMath';
import { useApp } from '../../context/AppContext';

export const CalculatorToolsView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { logToolUsage } = useApp();

  // --- 1. ATTENDANCE CALCULATOR ---
  const [attendedClasses, setAttendedClasses] = useState(38);
  const [totalClasses, setTotalClasses] = useState(48);
  const [targetPercent, setTargetPercent] = useState(75);

  // --- 2. GPA CALCULATOR ---
  const [courses, setCourses] = useState<CourseGrade[]>([
    { id: '1', name: 'Data Structures & Algorithms', credits: 4, gradePoints: 4.0 },
    { id: '2', name: 'Linear Algebra', credits: 3, gradePoints: 3.7 },
    { id: '3', name: 'Digital Logic Design', credits: 4, gradePoints: 3.3 },
    { id: '4', name: 'Academic Writing & Research', credits: 2, gradePoints: 4.0 },
  ]);

  // --- 3. CGPA CALCULATOR ---
  const [prevCgpa, setPrevCgpa] = useState(3.45);
  const [prevCredits, setPrevCredits] = useState(45);
  const [currentGpa, setCurrentGpa] = useState(3.8);
  const [currentCredits, setCurrentCredits] = useState(15);
  const [targetCgpaGoal, setTargetCgpaGoal] = useState(3.7);
  const [remainingCreditsGoal, setRemainingCreditsGoal] = useState(30);

  // --- 4. PERCENTAGE CALCULATOR ---
  const [p1X, setP1X] = useState(15);
  const [p1Y, setP1Y] = useState(250);
  const [p2Part, setP2Part] = useState(42);
  const [p2Whole, setP2Whole] = useState(50);
  const [p3Old, setP3Old] = useState(80);
  const [p3New, setP3New] = useState(95);

  // --- 5. AVERAGE / STATISTICS ---
  const [statsInput, setStatsInput] = useState('85, 92, 78, 90, 88, 95, 82, 90, 74, 98');

  // --- 6. FRACTION CALCULATOR ---
  const [fracN1, setFracN1] = useState(3);
  const [fracD1, setFracD1] = useState(4);
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [fracN2, setFracN2] = useState(2);
  const [fracD2, setFracD2] = useState(5);

  // --- 7. SCIENTIFIC CALCULATOR ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // --- 8. UNIT CONVERTER ---
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'temp' | 'speed'>('length');
  const [unitValue, setUnitValue] = useState(10);

  // --- 9. COMPOUND INTEREST ---
  const [ciPrincipal, setCiPrincipal] = useState(5000);
  const [ciRate, setCiRate] = useState(6.5);
  const [ciYears, setCiYears] = useState(4);
  const [ciCompounds, setCiCompounds] = useState(12);

  // --- 10. DISCOUNT CALCULATOR ---
  const [discPrice, setDiscPrice] = useState(120);
  const [discPercent, setDiscPercent] = useState(20);
  const [discTax, setDiscTax] = useState(8.5);

  // --- 11. AGE & DATE ---
  const [birthDate, setBirthDate] = useState('2004-05-15');

  // --- 12. BMI ---
  const [bmiWeight, setBmiWeight] = useState(68);
  const [bmiHeight, setBmiHeight] = useState(175);

  // --- 1. ATTENDANCE CALCULATOR VIEW ---
  if (toolSlug === 'attendance-calculator') {
    const res = calculateAttendance(attendedClasses, totalClasses, targetPercent);

    return (
      <div className="space-y-6">
        {/* Controls Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Classes Attended (A)
              </label>
              <input
                type="number"
                min={0}
                value={attendedClasses}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setAttendedClasses(val);
                  logToolUsage('attendance-calculator', `Attended: ${val}/${totalClasses}`);
                }}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-lg font-bold text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Total Classes Held (T)
              </label>
              <input
                type="number"
                min={1}
                value={totalClasses}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setTotalClasses(val);
                }}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-lg font-bold text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Minimum Required % (R)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={targetPercent}
                onChange={(e) => setTargetPercent(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-lg font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Big Result Card */}
        <div
          className={`p-6 rounded-2xl border ${
            res.status === 'safe'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {res.status === 'safe' ? (
                  <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="size-6 text-rose-600 dark:text-rose-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {res.status === 'safe' ? 'Safe Attendance Status' : 'Attendance Warning'}
                </span>
              </div>
              <div className="text-4xl font-extrabold mt-2">
                {res.currentPercentage}%
              </div>
              <p className="mt-2 text-sm leading-relaxed max-w-xl">
                {res.message}
              </p>
            </div>

            <div className="sm:text-right p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-inherit min-w-[180px]">
              {res.status === 'safe' ? (
                <>
                  <div className="text-[11px] font-semibold uppercase text-neutral-500">Can Miss (Bunk)</div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {res.classesCanMiss}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">more classes safely</div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-semibold uppercase text-neutral-500">Must Attend</div>
                  <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                    {res.classesNeeded}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">consecutive classes</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Math explanation card */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
          <div className="font-semibold text-neutral-800 dark:text-neutral-200">How this calculation works:</div>
          <div>• Current % formula: <span className="font-mono">({attendedClasses} / {totalClasses}) × 100 = {res.currentPercentage}%</span></div>
          {res.status === 'safe' ? (
            <div>• Safe miss formula: solve <span className="font-mono">{attendedClasses} / ({totalClasses} + y) ≥ {targetPercent}%</span> for upcoming missed classes.</div>
          ) : (
            <div>• Recovery formula: solve <span className="font-mono">({attendedClasses} + x) / ({totalClasses} + x) ≥ {targetPercent}%</span> for required consecutive attendances.</div>
          )}
        </div>
      </div>
    );
  }

  // --- 2. GPA CALCULATOR VIEW ---
  if (toolSlug === 'gpa-calculator') {
    const gpaResult = calculateGPA(courses);

    const gradeScaleOptions = [
      { label: 'A+ (4.0)', value: 4.0 },
      { label: 'A (4.0)', value: 4.0 },
      { label: 'A- (3.7)', value: 3.7 },
      { label: 'B+ (3.3)', value: 3.3 },
      { label: 'B (3.0)', value: 3.0 },
      { label: 'B- (2.7)', value: 2.7 },
      { label: 'C+ (2.3)', value: 2.3 },
      { label: 'C (2.0)', value: 2.0 },
      { label: 'C- (1.7)', value: 1.7 },
      { label: 'D (1.0)', value: 1.0 },
      { label: 'F (0.0)', value: 0.0 },
    ];

    const addCourseRow = () => {
      const newCourse: CourseGrade = {
        id: 'c-' + Date.now(),
        name: `Course ${courses.length + 1}`,
        credits: 3,
        gradePoints: 4.0,
      };
      setCourses([...courses, newCourse]);
    };

    const removeCourseRow = (id: string) => {
      setCourses(courses.filter((c) => c.id !== id));
    };

    const updateCourse = (id: string, field: keyof CourseGrade, value: any) => {
      setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
      logToolUsage('gpa-calculator', `Calculated GPA: ${gpaResult.gpa}`);
    };

    return (
      <div className="space-y-6">
        {/* GPA Highlight Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Semester Grade Point Average
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white mt-1">
              {gpaResult.gpa} <span className="text-lg text-neutral-500 font-normal">/ 4.00</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total Credits</div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{gpaResult.totalCredits}</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Grade Points</div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{gpaResult.totalGradePoints}</div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Course Details ({courses.length})
            </h4>
            <button
              onClick={addCourseRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="space-y-2.5 min-w-[500px]">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700"
              >
                <span className="text-xs font-bold text-neutral-400 w-6 text-center select-none">{idx + 1}</span>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  placeholder="Course title"
                  className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-neutral-500">Credits:</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={course.credits}
                    onChange={(e) => updateCourse(course.id, 'credits', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-center font-bold text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-neutral-500">Grade:</label>
                  <select
                    value={course.gradePoints}
                    onChange={(e) => updateCourse(course.id, 'gradePoints', parseFloat(e.target.value))}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white"
                  >
                    {gradeScaleOptions.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => removeCourseRow(course.id)}
                  disabled={courses.length <= 1}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 disabled:opacity-30 rounded-md"
                  title="Remove Course"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 3. CGPA CALCULATOR VIEW ---
  if (toolSlug === 'cgpa-calculator') {
    const combinedCgpa = calculateCGPA(prevCgpa, prevCredits, currentGpa, currentCredits);
    const neededGpa = calculateTargetGPA(combinedCgpa, prevCredits + currentCredits, targetCgpaGoal, remainingCreditsGoal);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cumulative CGPA Calculator */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Calculate Combined Cumulative CGPA
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500">Previous CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={prevCgpa}
                  onChange={(e) => setPrevCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Previous Credits</label>
                <input
                  type="number"
                  min="0"
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Current Semester GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={currentGpa}
                  onChange={(e) => setCurrentGpa(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Current Semester Credits</label>
                <input
                  type="number"
                  min="0"
                  value={currentCredits}
                  onChange={(e) => setCurrentCredits(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase">New Combined CGPA</div>
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {combinedCgpa} <span className="text-sm font-normal text-neutral-500">/ 4.00</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">Total credits completed: {prevCredits + currentCredits}</div>
            </div>
          </div>

          {/* Target CGPA Goal Predictor */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Target Honors & Goal Predictor
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500">Goal Target CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={targetCgpaGoal}
                  onChange={(e) => setTargetCgpaGoal(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Remaining Credits</label>
                <input
                  type="number"
                  min="1"
                  value={remainingCreditsGoal}
                  onChange={(e) => setRemainingCreditsGoal(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase">Required Average GPA</div>
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {neededGpa !== null ? neededGpa : 'N/A'}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {neededGpa && neededGpa > 4.0
                  ? 'Mathematically unattainable with remaining credits.'
                  : `Maintain a ${neededGpa} GPA across your next ${remainingCreditsGoal} credits to reach ${targetCgpaGoal}.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. PERCENTAGE CALCULATOR VIEW ---
  if (toolSlug === 'percentage-calculator') {
    const res1 = calculatePercentOf(p1X, p1Y);
    const res2 = calculateWhatPercent(p2Part, p2Whole);
    const res3 = calculatePercentChange(p3Old, p3New);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tab 1: X% of Y */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">What is X% of Y?</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={p1X}
              onChange={(e) => setP1X(parseFloat(e.target.value) || 0)}
              className="w-20 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
            <span className="text-xs font-medium">% of</span>
            <input
              type="number"
              value={p1Y}
              onChange={(e) => setP1Y(parseFloat(e.target.value) || 0)}
              className="w-24 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold text-xl">
            = {res1}
          </div>
        </div>

        {/* Tab 2: X is what % of Y */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">X is what % of Y?</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={p2Part}
              onChange={(e) => setP2Part(parseFloat(e.target.value) || 0)}
              className="w-20 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
            <span className="text-xs font-medium">out of</span>
            <input
              type="number"
              value={p2Whole}
              onChange={(e) => setP2Whole(parseFloat(e.target.value) || 0)}
              className="w-24 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold text-xl">
            = {res2.toFixed(2)}%
          </div>
        </div>

        {/* Tab 3: % Change */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">% Increase / Decrease</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={p3Old}
              onChange={(e) => setP3Old(parseFloat(e.target.value) || 0)}
              className="w-20 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
            <span className="text-xs font-medium">to</span>
            <input
              type="number"
              value={p3New}
              onChange={(e) => setP3New(parseFloat(e.target.value) || 0)}
              className="w-24 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-sm font-bold text-center"
            />
          </div>
          <div
            className={`p-3 rounded-xl font-bold text-xl ${
              res3 >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
            }`}
          >
            {res3 >= 0 ? `+${res3}% increase` : `${res3}% decrease`}
          </div>
        </div>
      </div>
    );
  }

  // --- 5. AVERAGE / STATISTICS CALCULATOR ---
  if (toolSlug === 'average-calculator') {
    const parsedNums = statsInput
      .split(/[, ]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

    const stats = calculateStatistics(parsedNums);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Enter test scores or numbers (separated by commas or spaces):
          </label>
          <textarea
            value={statsInput}
            onChange={(e) => setStatsInput(e.target.value)}
            rows={3}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <div className="text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-300">Mean (Average)</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.mean}</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40">
            <div className="text-[11px] font-semibold uppercase text-purple-700 dark:text-purple-300">Median</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.median}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">Standard Deviation</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.stdDev}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-300">Range (Min - Max)</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.range}</div>
            <div className="text-[10px] text-neutral-500">{stats.min} to {stats.max}</div>
          </div>
        </div>
      </div>
    );
  }

  // --- 6. FRACTION CALCULATOR ---
  if (toolSlug === 'fraction-calculator') {
    let fracResult: any = null;
    let fracError = '';
    try {
      fracResult = calculateFractions(fracN1, fracD1, fracN2, fracD2, fracOp);
    } catch (e: any) {
      fracError = e.message;
    }

    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
          {/* Fraction 1 */}
          <div className="flex flex-col items-center">
            <input
              type="number"
              value={fracN1}
              onChange={(e) => setFracN1(parseInt(e.target.value) || 0)}
              className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-center font-bold"
            />
            <div className="w-16 h-0.5 bg-neutral-400 my-1.5" />
            <input
              type="number"
              value={fracD1}
              onChange={(e) => setFracD1(parseInt(e.target.value) || 1)}
              className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-center font-bold"
            />
          </div>

          {/* Operator Select */}
          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {(['+', '-', '*', '/'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setFracOp(op)}
                className={`w-9 h-9 rounded-lg font-bold text-sm ${
                  fracOp === op ? 'bg-blue-600 text-white' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Fraction 2 */}
          <div className="flex flex-col items-center">
            <input
              type="number"
              value={fracN2}
              onChange={(e) => setFracN2(parseInt(e.target.value) || 0)}
              className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-center font-bold"
            />
            <div className="w-16 h-0.5 bg-neutral-400 my-1.5" />
            <input
              type="number"
              value={fracD2}
              onChange={(e) => setFracD2(parseInt(e.target.value) || 1)}
              className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-center font-bold"
            />
          </div>
        </div>

        {fracError ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold text-center">
            {fracError}
          </div>
        ) : fracResult ? (
          <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center">
            <div className="text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-300">Simplified Result</div>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                {fracResult.numerator} / {fracResult.denominator}
              </div>
              {fracResult.mixed && (
                <div className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                  ({fracResult.mixed})
                </div>
              )}
            </div>
            <div className="text-xs text-neutral-500 mt-1">Decimal: {fracResult.decimal}</div>
          </div>
        ) : null}
      </div>
    );
  }

  // --- 7. SCIENTIFIC CALCULATOR ---
  if (toolSlug === 'scientific-calculator') {
    const handleBtn = (val: string) => {
      if (val === 'C') {
        setCalcDisplay('0');
      } else if (val === '⌫') {
        setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      } else if (val === '=') {
        try {
          // Safe evaluation using Math functions
          const sanitized = calcDisplay
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**');

          // eslint-disable-next-line no-eval
          const evaluated = Function(`'use strict'; return (${sanitized})`)();
          setCalcHistory((prev) => [`${calcDisplay} = ${evaluated}`, ...prev.slice(0, 5)]);
          setCalcDisplay(String(evaluated));
          logToolUsage('scientific-calculator', `${calcDisplay} = ${evaluated}`);
        } catch (e) {
          setCalcDisplay('Error');
        }
      } else {
        setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
      }
    };

    const buttons = [
      ['sin(', 'cos(', 'tan(', 'sqrt(', 'C', '⌫'],
      ['log(', 'ln(', '^', 'π', '(', ')'],
      ['7', '8', '9', '/', '*'],
      ['4', '5', '6', '-', '+'],
      ['1', '2', '3', '0', '.'],
      ['='],
    ];

    return (
      <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        {/* Screen */}
        <div className="bg-neutral-900 text-white rounded-2xl p-4 text-right">
          <div className="text-[11px] text-neutral-400 font-mono h-4">
            {calcHistory[0] || ''}
          </div>
          <div className="text-3xl font-mono font-bold truncate mt-1">
            {calcDisplay}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {['sin(', 'cos(', 'tan(', 'sqrt('].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-200">
              {b.replace('(', '')}
            </button>
          ))}
          {['log(', 'ln(', 'π', '^'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-200">
              {b.replace('(', '')}
            </button>
          ))}
          {['C', '⌫', '(', ')'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100">
              {b}
            </button>
          ))}
          {['7', '8', '9', '/'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-bold hover:bg-neutral-200">
              {b}
            </button>
          ))}
          {['4', '5', '6', '*'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-bold hover:bg-neutral-200">
              {b}
            </button>
          ))}
          {['1', '2', '3', '-'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-bold hover:bg-neutral-200">
              {b}
            </button>
          ))}
          {['0', '.', '+'].map((b) => (
            <button key={b} onClick={() => handleBtn(b)} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-bold hover:bg-neutral-200">
              {b}
            </button>
          ))}
          <button onClick={() => handleBtn('=')} className="col-span-1 p-3 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700">
            =
          </button>
        </div>
      </div>
    );
  }

  // --- 8. UNIT CONVERTER ---
  if (toolSlug === 'unit-converter') {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-5">
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          {(['length', 'weight', 'temp', 'speed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setUnitType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                unitType === t ? 'bg-blue-600 text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-neutral-500">Value to convert:</label>
          <input
            type="number"
            value={unitValue}
            onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-lg font-bold"
          />
        </div>

        {unitType === 'length' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Meters (m)</div>
              <div className="text-lg font-bold mt-1">{unitValue}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Kilometers (km)</div>
              <div className="text-lg font-bold mt-1">{(unitValue / 1000).toFixed(4)}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Feet (ft)</div>
              <div className="text-lg font-bold mt-1">{(unitValue * 3.28084).toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Miles (mi)</div>
              <div className="text-lg font-bold mt-1">{(unitValue * 0.000621371).toFixed(4)}</div>
            </div>
          </div>
        )}

        {unitType === 'weight' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Kilograms (kg)</div>
              <div className="text-lg font-bold mt-1">{unitValue}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Pounds (lbs)</div>
              <div className="text-lg font-bold mt-1">{(unitValue * 2.20462).toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Grams (g)</div>
              <div className="text-lg font-bold mt-1">{unitValue * 1000}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Ounces (oz)</div>
              <div className="text-lg font-bold mt-1">{(unitValue * 35.274).toFixed(2)}</div>
            </div>
          </div>
        )}

        {unitType === 'temp' && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Celsius (°C)</div>
              <div className="text-lg font-bold mt-1">{unitValue}°C</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Fahrenheit (°F)</div>
              <div className="text-lg font-bold mt-1">{((unitValue * 9) / 5 + 32).toFixed(1)}°F</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Kelvin (K)</div>
              <div className="text-lg font-bold mt-1">{(unitValue + 273.15).toFixed(2)} K</div>
            </div>
          </div>
        )}

        {unitType === 'speed' && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Kilometers/hour (km/h)</div>
              <div className="text-lg font-bold mt-1">{unitValue}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Miles/hour (mph)</div>
              <div className="text-lg font-bold mt-1">{(unitValue * 0.621371).toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-neutral-500">Meters/second (m/s)</div>
              <div className="text-lg font-bold mt-1">{(unitValue / 3.6).toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 9. COMPOUND & SIMPLE INTEREST ---
  if (toolSlug === 'compound-interest') {
    const ciRes = calculateCompoundInterest(ciPrincipal, ciRate, ciYears, ciCompounds);
    const siRes = calculateSimpleInterest(ciPrincipal, ciRate, ciYears);

    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-neutral-500">Principal ($)</label>
            <input
              type="number"
              value={ciPrincipal}
              onChange={(e) => setCiPrincipal(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Annual Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={ciRate}
              onChange={(e) => setCiRate(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Time (Years)</label>
            <input
              type="number"
              value={ciYears}
              onChange={(e) => setCiYears(parseFloat(e.target.value) || 1)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Frequency</label>
            <select
              value={ciCompounds}
              onChange={(e) => setCiCompounds(parseInt(e.target.value))}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold text-xs"
            >
              <option value={12}>Monthly (12x)</option>
              <option value={4}>Quarterly (4x)</option>
              <option value={1}>Annually (1x)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Compound Future Value</div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">${ciRes.finalAmount}</div>
            <div className="text-xs text-neutral-500 mt-1">Total interest earned: ${ciRes.totalInterest}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Simple Interest Equivalent</div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">${siRes.total}</div>
            <div className="text-xs text-neutral-500 mt-1">Simple interest earned: ${siRes.interest}</div>
          </div>
        </div>
      </div>
    );
  }

  // --- 10. DISCOUNT CALCULATOR ---
  if (toolSlug === 'discount-calculator') {
    const dRes = calculateDiscount(discPrice, discPercent, discTax);

    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-neutral-500">Original Price ($)</label>
            <input
              type="number"
              value={discPrice}
              onChange={(e) => setDiscPrice(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Discount (%)</label>
            <input
              type="number"
              value={discPercent}
              onChange={(e) => setDiscPercent(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Tax (%)</label>
            <input
              type="number"
              value={discTax}
              onChange={(e) => setDiscTax(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Final Price</div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">${dRes.finalPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saved: ${dRes.totalSavings}</div>
            <div className="text-[11px] text-neutral-500">Tax: ${dRes.taxAmount}</div>
          </div>
        </div>
      </div>
    );
  }

  // --- 11. AGE & DATE ---
  if (toolSlug === 'age-calculator') {
    const ageRes = calculateAge(birthDate);

    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Select Date of Birth:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold text-sm"
          />
        </div>

        {ageRes && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-center">
              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Exact Age</div>
              <div className="text-2xl font-bold mt-1">{ageRes.years} yrs, {ageRes.months} mos</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-center">
              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total Days Alive</div>
              <div className="text-2xl font-bold mt-1">{ageRes.totalDays.toLocaleString()} days</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Next Birthday</div>
              <div className="text-2xl font-bold mt-1">in {ageRes.daysUntilBirthday} days</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 12. BMI CALCULATOR ---
  const bmiRes = calculateBMI(bmiWeight, bmiHeight);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-neutral-500">Weight (kg)</label>
          <input
            type="number"
            value={bmiWeight}
            onChange={(e) => setBmiWeight(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500">Height (cm)</label>
          <input
            type="number"
            value={bmiHeight}
            onChange={(e) => setBmiHeight(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold text-sm"
          />
        </div>
      </div>

      {bmiRes && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Body Mass Index</div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">{bmiRes.bmi}</div>
            <div className={`text-xs font-bold mt-1 ${bmiRes.color}`}>{bmiRes.category}</div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <div>Ideal healthy weight:</div>
            <div className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{bmiRes.idealWeightRange}</div>
          </div>
        </div>
      )}
    </div>
  );
};
