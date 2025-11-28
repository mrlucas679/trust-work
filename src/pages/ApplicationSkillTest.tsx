import { useParams } from 'react-router-dom';

export default function ApplicationSkillTest() {
    const { id } = useParams();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-4">Skill Test</h1>
                <p className="text-muted-foreground">
                    Skill test for application {id} will appear here.
                </p>
            </div>
        </div>
    );
}
