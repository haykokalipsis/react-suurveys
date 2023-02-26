import React, {useEffect, useRef, useState} from 'react';
import PageComponent from "../layouts/PageComponent.jsx";
import {PhotoIcon} from "@heroicons/react/24/solid/index.js";
import TButton from "../components/core/TButton.jsx";
import axiosClient from "../axios.js";
import {useNavigate, useParams} from "react-router-dom";
import Questions from "../components/Questions.jsx";
import { v4 as uuidv4} from 'uuid';
import {PlusIcon, TrashIcon, LinkIcon} from '@heroicons/react/24/outline';

import {useStateContext} from "../contexts/ContextProvider.jsx";

const SurveyCreate = () => {
    const navigate = useNavigate();
    const {id} = useParams();

    const {showToast} = useStateContext();

    const [survey, setSurvey] = useState({
        title: '',
        slug: '',
        status: false,
        description: '',
        image: null,
        image_url: null,
        expire_date: '',
        questions: [],
    });
    const [oneError, setOneError] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const shouldRun = useRef(true); // We use this so useEffect doesent run twice https://www.youtube.com/watch?v=MXSuOR2yRvQ
    useEffect( () => {
        if (shouldRun.current) {
            shouldRun.current = false;
            // Code
            if (id) {
                setLoading(true);
                axiosClient.get(`surveys/${id}`)
                    .then((response) =>{
                        console.log(response.data.data);
                        setSurvey(response.data.data);
                    })
                    .finally( () => setLoading(false));
            }
        }
    }, []);


    const onDelete = () => {

    };

    const onImageChoose = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            setSurvey({
                ...survey,
                image: file,
                image_url: reader.result,
            });

            e.target.value = '';
        };

        reader.readAsDataURL(file);
    }

    const onSubmit = (e) => {
        e.preventDefault();

        const payload = {...survey};
        if (payload.image) {
            payload.image = payload.image_url;
        }
        delete payload.image_url;

        let httpRequest = null
        httpRequest = (id)
            ? axiosClient.put(`/surveys/${id}`, payload)
            : axiosClient.post('/surveys', payload);

        httpRequest
            .then(responce => {
                console.log(responce);
                navigate('/surveys');
                showToast(`The survey was ${ (id) ? 'updated' : 'created'}`)
            })
            .catch(error => {
                if (error && error.response) {
                    setOneError(error.response.data.message);
                    setErrors(error.response.data.errors);
                }
                console.log(error?.response?.data?.errors);
            })
    }

    const onQuestionsUpdate = (questions) => {
        setSurvey({
            ...survey,
            questions
        });
    };

    const addQuestion = () => {
        survey.questions.push({
            id: uuidv4(),
            type: 'text',
            title: '',
            description: '',
            data: {},
        });
        setSurvey({...survey});
    };

    return (
        <PageComponent
            title={!id ? 'Create New Survey' : 'Update Survey'}
            buttons={(
                <div className={'flex  gap-2'}>
                    <TButton color={'green'} href={`/surveys/public/${survey.slug}`}>
                        <LinkIcon className='h-4 w-4 mr-2'/>
                        Public link
                    </TButton>

                    <TButton color={'red'} to='/surveys/create' onClick={onDelete}>
                        <TrashIcon className={'h-4 w-4 mr-2'} />
                        Delete
                    </TButton>
                </div>
            )}
        >

            { (loading) && (
                <div className={'text-center text-lg'}>Loading...</div>
            )}

            { (!loading) && (
                <form action="#" method={'POST'} onSubmit={onSubmit}>
                    <div className="shadow sm:overflow-hidden sm:rounded-md">
                        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                            {oneError && (
                                <div className="bg-red-500 text-white py-3 px-3">{oneError}</div>
                            )}

                            {/*  Image  */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700">Photo</label>
                                <div className="mt-1 flex items-center">
                                    { (survey.image_url) ? ( // if
                                        <img src={survey.image_url} alt="" className={'w-32 h-32 object-cover'}/>
                                    ) : ( // else
                                        <span className={'flex justify-center items-center text-gray-400 h-12 w-12 overflow-hidden rounded-full bg-gray-100'}>
                                            <PhotoIcon className={'w-8 h-8'} />
                                        </span>
                                    )}

                                    <button type={'button'} className="relative ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <input
                                            type="file"
                                            className={`absolute left-0 top-0 right-0 bottom-0 opacity-0`}
                                            onChange={onImageChoose}
                                        />
                                        Change
                                    </button>
                                </div>
                            </div>
                            {/*  Image  */}

                             {/*<pre>{ JSON.stringify(survey, undefined, 2) }</pre>*/}

                            {/*Title*/}
                            {/*<TitleInp titleVal={survey.title} onInpEvent={newValue => setSurvey({...survey, title: newValue})}/>*/}
                            <div className="col-span-6 sm:col-span-3">
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Survey Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={survey.title}
                                    onChange={(ev) =>
                                        setSurvey({ ...survey, title: ev.target.value })
                                    }
                                    placeholder="Survey Title"
                                    className={`mt - 1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.title ? "border-red-500" : ""}`}
                                />

                                { (errors.title) && (
                                    <small className={'text-red-500'}>{errors.title[0]}</small>
                                )}
                            </div>
                            {/*Title*/}

                            {/*Description*/}
                            <div className="col-span-6 sm:col-span-3">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                {/* <pre>{ JSON.stringify(survey, undefined, 2) }</pre> */}
                                <textarea
                                    name="description"
                                    id="description"
                                    value={survey.description || ""}
                                    onChange={(ev) =>
                                        setSurvey({ ...survey, description: ev.target.value })
                                    }
                                    placeholder="Describe your survey"
                                    className={`mt - 1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.description ? "border-red-500" : ""}`}
                                ></textarea>

                                { (errors.description) && (
                                    <small className={'text-red-500'}>{errors.description[0]}</small>
                                )}
                            </div>
                            {/*Description*/}

                            {/*Expire Date*/}
                            <div className="col-span-6 sm:col-span-3">
                                <label
                                    htmlFor="expire_date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Expire Date
                                </label>
                                <input
                                    type="date"
                                    name="expire_date"
                                    id="expire_date"
                                    value={survey.expire_date}
                                    onChange={(ev) =>
                                        setSurvey({ ...survey, expire_date: ev.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.expire_date ? "border-red-500" : ""}`}

                                />
                                { (errors.expire_date) && (
                                    <small className={'text-red-500'}>{errors.expire_date[0]}</small>
                                )}
                            </div>
                            {/*Expire Date*/}

                            {/*Active*/}
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="status"
                                        name="status"
                                        type="checkbox"
                                        checked={survey.status}
                                        onChange={(ev) =>
                                            setSurvey({ ...survey, status: ev.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label
                                        htmlFor="comments"
                                        className="font-medium text-gray-700"
                                    >
                                        Active
                                    </label>
                                    <p className="text-gray-500">
                                        Whether to make survey publicly available
                                    </p>
                                </div>
                            </div>
                            {/*Active*/}

                            {/* Add Question Button */}

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

                            {/* Add Question Button */}

                            <Questions questions={survey.questions} onQuestionsUpdate={onQuestionsUpdate}></Questions>

                            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                                <TButton>Save</TButton>
                            </div>
                        </div>
                    </div>
                </form>
            )}

        </PageComponent>
    );
};

export default SurveyCreate;
