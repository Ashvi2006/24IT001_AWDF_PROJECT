import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import PerformanceMetrics from '../components/PerformanceMetrics';
import TaskManager from '../components/TaskManager';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="home-page">
      <Header />
      <About />
      <Skills />
      <PerformanceMetrics />
      <TaskManager />
      <Footer />
    </div>
  );
}

export default Home;
