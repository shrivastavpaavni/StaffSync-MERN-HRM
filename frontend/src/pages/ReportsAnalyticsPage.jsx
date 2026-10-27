import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart3,
  Users,
  Clock,
  CalendarCheck,
  TrendingUp,
  Award,
  DollarSign,
  Building,
  CheckCircle,
} from 'lucide-react';

const ReportsAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await reportService.getAnalytics();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Calculating Organization Analytics...</span>
        </div>
      </div>
    );
  }

  const workforce = data?.workforce || { totalUsers: 0, totalEmployees: 0, totalManagers: 0, totalHR: 0, departmentDistribution: [] };
  const att = data?.attendance || { present: 0, late: 0, halfDay: 0, absent: 0, attendanceRate: 100, weeklyTrend: [] };
  const leaves = data?.leaves || { pending: 0, approved: 0, rejected: 0, distributionByType: [] };
  const trainings = data?.trainings || { totalTrainings: 0, activeTrainings: 0, totalParticipants: 0, completions: 0 };

  const totalLeavesEvaluated = leaves.approved + leaves.rejected + leaves.pending;
  const leaveApprovalRate =
    totalLeavesEvaluated > 0
      ? Math.round((leaves.approved / (leaves.approved + leaves.rejected || 1)) * 100)
      : 100;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Human Resource Reports & Intelligence</h3>
          <p className="text-secondary small mb-0">
            Real-time aggregate data, department resource distribution, and operational KPIs.
          </p>
        </div>
        <span className="badge-soft-primary py-2 px-3 fw-semibold">
          Data as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Primary KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Total Active Personnel"
            value={workforce.totalEmployees}
            subtitle={`${workforce.totalManagers} Managers • ${workforce.totalHR} HR Directors`}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Today's Attendance"
            value={`${att.attendanceRate}%`}
            subtitle={`${att.present} Present • ${att.late} Late Arrivals`}
            icon={Clock}
            color="success"
            trend="+3.1%"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Leave Approval Rate"
            value={`${leaveApprovalRate}%`}
            subtitle={`${leaves.approved} Approved of ${totalLeavesEvaluated} Requests`}
            icon={CalendarCheck}
            color="info"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Training Engagement"
            value={`${trainings.totalParticipants} Enrolled`}
            subtitle={`${trainings.activeTrainings} Active Program Tracks`}
            icon={Award}
            color="warning"
          />
        </div>
      </div>

      {/* Deep-Dive Grid */}
      <div className="row g-4 mb-4">
        {/* Department Resource Allocation */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-1">Department Workforce Allocation</h5>
            <p className="text-secondary small mb-4">Headcount breakdown and average salary benchmarks.</p>

            <div className="d-flex flex-column gap-3">
              {workforce.departmentDistribution.map((dept) => {
                const pct = Math.round((dept.count / workforce.totalEmployees) * 100) || 0;
                return (
                  <div key={dept._id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark">{dept._id}</span>
                      <span className="fw-semibold text-primary">
                        {dept.count} Staff ({pct}%)
                      </span>
                    </div>

                    <div className="progress mb-2" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${pct}%`,
                          background: 'var(--primary-gradient)',
                          borderRadius: '4px',
                        }}
                      ></div>
                    </div>

                    <div className="d-flex justify-content-between small text-muted">
                      <span>Benchmark Average:</span>
                      <span className="fw-semibold text-dark">
                        ${Math.round(dept.avgSalary).toLocaleString()} / year
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7-Day Attendance Trend Analysis */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-1">Weekly Attendance Rate Trend</h5>
            <p className="text-secondary small mb-4">Daily percentage of workforce present on-site / remote.</p>

            <div className="p-3 bg-light rounded-3 border mb-3">
              <div
                className="d-flex align-items-end justify-content-between gap-2 pt-3"
                style={{ height: '200px' }}
              >
                {att.weeklyTrend?.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end"
                  >
                    <span className="small fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>
                      {item.rate}%
                    </span>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${Math.max(12, item.rate)}%`,
                        background:
                          item.rate >= 90
                            ? 'var(--success)'
                            : item.rate >= 75
                            ? 'var(--primary)'
                            : 'var(--warning)',
                        transition: 'height 0.4s ease',
                      }}
                    ></div>
                    <span className="text-muted small mt-2 fw-semibold" style={{ fontSize: '0.72rem' }}>
                      {item.dayName}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      {item.present}/{item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="row g-2 text-center small">
              <div className="col-4">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Present Today</div>
                  <div className="fw-bold text-success fs-6">{att.present}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Late Arrivals</div>
                  <div className="fw-bold text-warning fs-6">{att.late}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Absent / Unrecorded</div>
                  <div className="fw-bold text-danger fs-6">{att.absent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Leave Distribution & Training Performance */}
      <div className="row g-4">
        {/* Leave Distribution by Category */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-1">Time-Off Distribution by Category</h5>
            <p className="text-secondary small mb-3">Aggregated volume and total days consumed.</p>

            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Leave Category</th>
                    <th>Applications</th>
                    <th>Total Days</th>
                    <th>Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.distributionByType?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No leave records recorded yet
                      </td>
                    </tr>
                  ) : (
                    leaves.distributionByType.map((item) => (
                      <tr key={item._id}>
                        <td className="fw-semibold text-dark">{item._id}</td>
                        <td>{item.count} applications</td>
                        <td className="fw-bold">{item.totalDays} day(s)</td>
                        <td>
                          <span className="badge-soft-primary">
                            {Math.round((item.totalDays / 50) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Development & Training Analytics */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-1">Upskilling & Training Metrics</h5>
            <p className="text-secondary small mb-3">Participation levels in corporate development courses.</p>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small">Total Training Tracks</span>
                  <h3 className="fw-bold text-dark mt-1 mb-0">{trainings.totalTrainings}</h3>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small">Total Participant Slots</span>
                  <h3 className="fw-bold text-primary mt-1 mb-0">{trainings.totalParticipants}</h3>
                </div>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between small fw-semibold mb-1">
                <span>Training Completion Rate:</span>
                <span className="text-success">
                  {trainings.totalParticipants > 0
                    ? Math.round((trainings.completions / trainings.totalParticipants) * 100)
                    : 100}
                  %
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{
                    width: `${
                      trainings.totalParticipants > 0
                        ? (trainings.completions / trainings.totalParticipants) * 100
                        : 100
                    }%`,
                    borderRadius: '4px',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
