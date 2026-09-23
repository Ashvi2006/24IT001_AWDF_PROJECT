import './Skills.css';

const skills = [
  'React.js 18',
  'React.lazy() & Suspense Code-Splitting',
  'React Router v6 Client-Side Routing',
  'JavaScript ES6+',
  'Node.js & Express REST API',
  'MongoDB Atlas & Mongoose',
  'JWT Authentication Middleware',
  'Bcrypt Password Hashing'
];

function Skills() {
  return (
    <section className="skills-card card">
      <h2 className="section-title">⚡ Technical Skills</h2>
      <ul className="skills-list">
        {skills.map((skill, index) => (
          <li key={index} className="skill-item">
            <span className="skill-icon">🔥</span> {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
