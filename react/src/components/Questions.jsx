import {useEffect, useState} from 'react';
import {PlusIcon} from "@heroicons/react/24/solid/index.js";
import QuestionEditor from "./QuestionEditor.jsx";
import { v4 as uuidv4} from 'uuid';

const Questions = ({questions, onQuestionsUpdate}) => {
    const [localQuestions, setLocalQuestions] = useState([...questions]);

    const addQuestion = (index) => {
        index = (index !== undefined)
            ? index
            : localQuestions.length;

        // Add question at selected index
        localQuestions.splice(index, 0, {
            id: uuidv4(),
            type: 'text',
            title: '',
            description: '',
            data: {},
        });

        setLocalQuestions([...localQuestions]);
        onQuestionsUpdate(localQuestions);
    };

    const questionChange = (question) => {
        if ( ! question) return;

        // Update the questions
        const changedQuestions = localQuestions.map( (q) => {
            // We pass the question with changed data (but id is unchanged of course)
            // Loop through questions, find that specific question (withh the id), change it with the one passed in function
            if (q.id === question.id) {
                return { ...question };
            }
            return q;
        });

        setLocalQuestions(changedQuestions);
        onQuestionsUpdate(changedQuestions);
    };

    const deleteQuestion = (question) => {
        const newQuestions = localQuestions.filter( (q) => q.id !== question.id);
        setLocalQuestions(newQuestions);
        onQuestionsUpdate(newQuestions);
    };

    useEffect(() => {
        setLocalQuestions(questions)
    }, [questions]);

    return (
        <>
            <div className="flex justify-between">
                <h3 className="text-2xl font-bold">Questions</h3>

                {/* <pre>{JSON.stringify(questions, undefined, 2)}</pre> */}

                <button
                    type='button'
                    className="flex items-center text-sm py-1 px-4 rounded-sm text-white bg-gray-600 hover:bg-gray-700"
                    onClick={(e) => {
                        // e.preventDefault()
                        addQuestion()
                    }}
                >
                    <PlusIcon className={'w-4 mr-2'} />
                    Add question
                </button>
            </div>

            { (localQuestions.length) ? ( // if
                localQuestions.map( (q, index) => (
                    <QuestionEditor
                        key={q.id} index={index}
                        question={q}
                        questionChange={questionChange}
                        addQuestion={addQuestion}
                        deleteQuestion={deleteQuestion}
                    />
                ))
            ) : ( // else
                <div className={'text-gray-400 text-center py-4'}>
                    You dont have any questions created
                </div>
            )}
        </>
    );
};

export default Questions;
