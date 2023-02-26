import {useEffect, useState} from "react";
import {PlusIcon, TrashIcon} from "@heroicons/react/24/solid/index.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import { v4 as uuidv4} from 'uuid';

const QuestionEditor = ({
    index = 0,
    question,
    addQuestion,
    deleteQuestion,
    questionChange,
}) => {
    const [model, setModel] = useState({...question});
    const { questionTypes } = useStateContext();

    function upperCaseFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    useEffect(() => {
        return () => {
            questionChange(model)
        };
    }, [model]);

    function shouldHaveOptions(type = null) {
        type = type || model.type;
        return ['select', 'radio', 'checkbox'].includes(type);
    }

    function onTypeChange(e) {
        const newModel = {...model, type: e.target.value}

        // If old type should not have options and new type should
        if (!shouldHaveOptions(model.type) && shouldHaveOptions(e.target.value)) {
            if (!model.data.options) {
                newModel.data = {
                    options: [{ uuid: uuidv4(), text: '' }]
                }
            }
        }
        setModel(newModel);
    }

    function addOption() {
        model.data.options.push({
            uuid: uuidv4(),
            text: ''
        });
        setModel({...model});
    }

    function deleteOption(op) {
        model.data.options = model.data.options.filter(option => option.uuid != op.uuid)
        setModel({...model})
    }

    return (
        <>
            <div className="flex justify-between mb-3">
                <h4>{index + 1}. {model.title}</h4>

                <div className="flex items-center">
                    <button
                        type={"button"}
                        className={'flex items-center text-xs py-1 px-3 mr-2 rounded-sm text-white bg-gray-600 hover:bg-gray-700'}
                        onClick={ () => addQuestion(index + 1)}
                    >
                        <PlusIcon className={'w-4'}/>
                        Add
                    </button>

                    <button
                        type={"button"}
                        className={'flex items-center text-xs py-1 px-3 rounded-sm border border-transparent text-red-500 hover:border-red-600 font-semibold'}
                        onClick={ ()=> deleteQuestion(question)}
                    >
                        <TrashIcon className={'w-4'}/>
                        Delete
                    </button>
                </div>
            </div>

            <div className="flex gap-3 justify-between mb-3">
                {/*  Question Title */}
                <div className="flex-1">
                    <label htmlFor="title" className={'block text-sm font-medium text-gray-700'}>Title</label>

                    <input
                        type="text"
                        name='title'
                        id='title'
                        value={model.title}
                        onChange={(e) => setModel({...model, title: e.target.value})}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    />
                </div>
                {/*  Question Title */}

                {/*  Question Type */}
                <div>
                    <label htmlFor="type" className={'block text-sm font-medium text-gray-700 w-40'}>Type</label>

                    <select
                        name='type'
                        id='type'
                        value={model.type}
                        onChange={onTypeChange}
                        className='mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    >
                        {questionTypes.map( (type, index) => (
                            <option value={type} key={type}>{upperCaseFirst(type)}</option>
                        ))}
                    </select>
                </div>
            {/*  Question Type */}
            </div>


            {/*  Question Description */}
            <div className={'mb-3'}>
                <label htmlFor="description" className={'block text-sm font-medium text-gray-700'}>Description</label>

                <textarea
                    name='description'
                    id='description'
                    value={model.description || ''}
                    onChange={(e) => setModel({...model, description: e.target.value})}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                >
                        </textarea>
            </div>
            {/*  Question Description */}

            {JSON.stringify(model)}
            <div>
                { (shouldHaveOptions()) && (
                    <div>
                        <h4 className={'text-sm font-semibold mb-1 flex justify-between items-center'}>
                            Options
                            <button onClick={addOption} type={"button"} className="flex items-center text-xs py-1 px-2 rounded-sm text-white bg-gray-600 hover:bg-gray-700">Add</button>
                        </h4>

                        { (model.data.options.length === 0) && (
                            <div className={'text-xs text-gray-600 text-center py-3'}>You dont have options defined</div>
                        )}

                        { (model.data.options.length > 0) && (
                            <div>
                                {model.data.options.map( (option, index) => (
                                    <div className={'flex items-center mb-1'} key={option.uuid}>
                                        <span className={'w-6 text-sm'}>{index + 1}.</span>

                                        <input
                                            onInput={e => {
                                                option.text = e.target.value;
                                                setModel({...model})
                                            }}
                                            value={option.text}
                                            type="text" className={'w-full rounded-sm py-1 px-2 text-xs border border-gray-300 focus:border-indigo-500'}/>

                                        <button onClick={(e)=>deleteOption(option)} type={'button'} className={'h-6 w-6 rounded-full flex items-center justify-center border border-transparent transition-colors hover:border-red-100'}>
                                            <TrashIcon className={'w-3 h-3 text-red-500'} />
                                        </button>
                                    </div>
                                ))}
                            </div>


                        )}
                    </div>
                )}
            </div>

            <hr/>
        </>
    );
};

export default QuestionEditor;
