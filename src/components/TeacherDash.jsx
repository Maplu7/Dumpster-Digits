import "./TeacherDash.css";

const assignments = [
  { id: 1, title: "Assignment 1", locked: false, score: 0 },
  { id: 2, title: "Assignment 2", locked: false, score: 0 },
  { id: 3, title: "Assignment 3", locked: true, score: 0 },
  { id: 4, title: "Assignment 4", locked: true, score: 0 },
];

const students = ["Student 1", "Student 2", "Student 3", "Student 4"];

const selectedStudent = {
  name: "Student 1",
  assignments: [
    { title: "Assignment 1", status: "Completed", score: 0 },
    { title: "Assignment 2", status: "Completed", score: 0 },
    { title: "Assignment 3", status: "Not Completed", score: 0 },
  ],
};

export default function TeacherDash() {
  return (
    <div className="tdash">
      
      <main className="tdash__main">
        <header className="tdash__header">
          <div>
            <h1 className="tdash__title">Welcome, Teacher Name</h1>
            <p className="tdash__subtitle">
              Manage your class activities and track student progress.
            </p>
          </div>

          <div className="tdash__class-box">
            <span className="tdash__class-label">Class</span>
            <strong className="tdash__class-name">Class Name</strong>
          </div>
        </header>

        <section className="tdash__stats">
          <div className="tdash__stat tdash__stat--orange">
            <div className="tdash__stat-number">0</div>
            <div className="tdash__stat-label">Students</div>
          </div>

          <div className="tdash__stat tdash__stat--blue">
            <div className="tdash__stat-number">0</div>
            <div className="tdash__stat-label">Assignments</div>
          </div>

          <div className="tdash__stat tdash__stat--green">
            <div className="tdash__stat-number">0%</div>
            <div className="tdash__stat-label">Class Overall Score</div>
          </div>
        </section>

        <section className="tdash__grid">
          <div className="tdash__card tdash__card--wide">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Assignments</h2>
              <button className="tdash__ghost-btn">Hide</button>
            </div>

            <div className="tdash__table-head">
              <span>Assignment</span>
              <span>Status</span>
              <span>Class Score</span>
            </div>

            <div className="tdash__table-body">
              {assignments.map((assignment) => (
                <div className="tdash__row" key={assignment.id}>
                  <span className="tdash__row-title">{assignment.title}</span>

                  <button
                    className={
                      assignment.locked
                        ? "tdash__status tdash__status--locked"
                        : "tdash__status tdash__status--unlocked"
                    }
                  >
                    {assignment.locked ? "Locked" : "Unlocked"}
                  </button>

                  <span className="tdash__score">{assignment.score}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tdash__card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Students</h2>
            </div>

            <div className="tdash__student-list">
              {students.map((student) => (
                <button className="tdash__student-btn" key={student}>
                  {student}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head">
            <h2 className="tdash__section-title">Student Details</h2>
          </div>

          <div className="tdash__details-header">
            <h3 className="tdash__details-name">{selectedStudent.name}</h3>
          </div>

          <div className="tdash__details-list">
            {selectedStudent.assignments.map((item) => (
              <div className="tdash__detail-item" key={item.title}>
                <div>
                  <div className="tdash__detail-title">{item.title}</div>
                  <div className="tdash__detail-status">Status: {item.status}</div>
                </div>

                <div className="tdash__pill">{item.score}%</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}