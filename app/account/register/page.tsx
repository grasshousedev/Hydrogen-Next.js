import { getInputStyleClasses } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { createCustomer, loginCustomer } from '@/lib/shopify';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import FormButton from '../component/FormButton';
import FormFooter from '../component/FormFooter';
import FormHeader from '../component/FormHeader';

let emailError: string | null = null;
let passwordError: string | null = null;

export default function RegisterPage() {
	async function handleSubmit(data: FormData) {
		'use server';
		const res = await createCustomer({
			variables: {
				input: {
					email: data.get('email') as string,
					password: data.get('password') as string,
				},
			},
		});

		if (res.body.data.customerCreate.customer) {
        const loginRes = await loginCustomer({
					variables: {
						input: {
							email: data.get('email') as string,
							password: data.get('password') as string,
						},
					},
				});
				
				if (loginRes.body.data.customerAccessTokenCreate.customerAccessToken?.accessToken) {
					// @ts-expect-error missing type
					cookies().set('customerAccessToken', loginRes.body.data.customerAccessTokenCreate.customerAccessToken.accessToken);
					redirect('/account');
				}

			redirect('/account/login');
		}

		if (res.body.data.customerCreate.customerUserErrors.length > 0) {
			res.body.data.customerCreate.customerUserErrors.filter((error: any) => {
				if (error.field.includes('email')) {
					emailError = error.message;
				}
				if (error.field.includes('password')) {
					passwordError = error.message;
				}
			});
		}

		revalidatePath('/account/register');
	}


	return (
		<div className="flex justify-center my-24 px-4">
			<div className="max-w-md w-full">
			<FormHeader title='Create an Account'/>
				<form
					action={handleSubmit}
					noValidate
					className="pt-6 pb-8 mt-4 mb-4 space-y-3"
				>
					<div>
						<input
							className={`mb-1 ${getInputStyleClasses(emailError)}`}
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							placeholder="Email address"
							aria-label="Email address"
							autoFocus
						/>
						{emailError && (
							<p className="text-red-500 text-xs">{emailError} &nbsp;</p>
						)}
					</div>
					<div>
						<input
							className={`mb-1 ${getInputStyleClasses(passwordError)}`}
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							placeholder="Password"
							aria-label="Password"
							minLength={8}
							required
							autoFocus
						/>
						{passwordError && (
							<p className="text-red-500 text-xs">
								{' '}
								{passwordError} &nbsp;
							</p>
						)}
					</div>
					<FormButton btnText='Create Account' />
					<FormFooter page="register" />
				</form>
			</div>
		</div>
	);
}
