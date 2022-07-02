import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';

function validateJokeName(name: string) {
  if (name.length < 3) {
    return 'Joke name must be at least 3 characters long';
  }
}

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return 'Joke content must be at least 10 characters long';
  }
}

type ActionData = {
  formError?: string;
  fields?: { name?: string; content?: string };
  fieldErrors?: { name?: string; content?: string };
};

export let loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return {};
};

export let action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  let userId = await requireUserId(request);
  let form = await request.formData();
  let name = form.get('name');
  let content = form.get('content');
  if (typeof name !== 'string' || typeof content !== 'string') {
    return {
      formError: 'Form submitted incorrectly',
    };
  }

  let fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields: { name, content } };
  }

  let joke = await db.joke.create({
    data: { name, content, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  let actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method='post'>
        <div>
          <label>
            Name:{' '}
            <input
              type='text'
              defaultValue={actionData?.fields?.name}
              name='name'
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? 'name-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className='form-validation-error' role='alert' id='name-error'>
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{' '}
            <textarea
              defaultValue={actionData?.fields?.content}
              name='content'
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? 'content-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className='form-validation-error'
              role='alert'
              id='content-error'
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className='form-validation-error' role='alert'>
              {actionData.formError}
            </p>
          ) : null}
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}